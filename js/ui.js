// seajs 的简单配置
seajs.config({
    base: "./editor",
    alias: {
        "$": "assets/jquery.js",
        "jquery": "assets/jquery.js",
        "magix": "assets/magix.js",
        "pat": "assets/magix/pat",
        "tmpl": "assets/magix/tmpl",

        //"exts": "assets/magix/exts.js",
    }
});

define('buildIcons', [], function (require, exports, module) {

    var icons = [], iconContainer = document.getElementById('icons');
    module.exports.loadAndBuild = function cloneIcon(pid) {
        //加载图标(默认第一个项目)
        $.ajax({
            url: '/svg/icons',
            method: 'post',
            data: { pid: pid }
        }).then(function (res) {
            icons = res;
            BuildFromJSON(icons);
        });
    }

    module.exports.filter = function _(keyStr) {
        if (!keyStr) {
            return BuildFromJSON(icons);
        }
        var filteredIcos = icons.filter(function _(ico) {
            ico = ico || {};
            var code = ico.code, name = ico.name;

            if (code.indexOf(keyStr) > -1 || name.indexOf(keyStr) > -1) {
                return true;
            }
        });
        BuildFromJSON(filteredIcos);
    }

    module.exports.checkDupli = function _(resKey) {
        resKey = { ...resKey };
        for (let ico in icons) {
            if (resKey[icons[ico].name]) {
                resKey[icons[ico].name] = false;
            }
        }
        return resKey
    }

    function BuildFromJSON(res) {
        var frame = document.createDocumentFragment();
        /* 后端已排序
        res.sort((a, b) => {//将图标以code大小顺序排序一下
            return a.code.localeCompare(b.code) > 0 ? 1 : -1
        }); */

        iconContainer.innerHTML = '';
        for (var i = 0; i < res.length; i++) {
            frame.appendChild(iconBuilder(res[i], i));
        }
        iconContainer.appendChild(frame)
    }

    var iconTpl = document.getElementsByClassName('icon-pt')[0];
    function iconBuilder(res, icoIndex) {
        var { code, name, id } = res,
            icon = iconTpl.cloneNode(true);

        icon.querySelector('.font-icon').innerHTML = String.fromCharCode(`0x${code}`);
        icon.querySelector('.icon-name').innerHTML = name;
        icon.querySelector('.icon-code').innerHTML = `0x${code}`;
        icon.querySelector('.icon-html').innerText = `&#x${code};`;

        /** 编辑 */
        var editBtns = icon.querySelectorAll('.icon-edit');
        for (let i = 0; i < editBtns.length; i++) {
            editBtns[i].setAttribute('fn', id);
            editBtns[i].setAttribute('ico-index', icoIndex);
        }
        return icon;
    }


    iconContainer.addEventListener('click', function (e) {

        var fn = e.target.getAttribute('fn'),
            fc = e.target.getAttribute('fc'),
            index = Number(e.target.getAttribute('ico-index'));

        if (!fn) return;

        if (fc == 'edit') {
            goEdit(fn, index);
        } else if (fc == 'down') {
            goDownload(fn);
        } else if (fc == 'del') {
            removeIco(fn, e.target);
        } else if (fc == 'copy') {
            doCopy(e.target);
        }

    });

    function goEdit(fn, index) {
        $.ajax({ method: 'GET', url: `/svg/get`, data: { fn } }).then((svgInfo) => {
            var xmlString = svgInfo.svg.replace(/xmlns\=("|').+svg("|')/, ''),
                code = svgInfo.code,
                name = svgInfo.name;

            var viewWidth = 1024,
                viewHeight = 1024,
                viewDims = new DOMParser().parseFromString(xmlString, 'text/xml').firstElementChild.getAttribute('viewBox').split(/\s|,/);
            try {

                if (viewDims.length == 1) {
                    viewWidth = viewDims[0];
                    viewHeight = viewDims[0];
                } else {
                    viewWidth = viewDims[2];
                    viewHeight = viewDims[3];
                }
            } catch (e) {
                console.warn(e);
            }

            require('assets/magix/helper').showDialog("assets/magix/edit_view", {
                viewOptions: {
                    unicode: parseInt(code, 16),
                    name,
                    id: fn,
                    pid: svgInfo.projectId,
                    fontname: currentProjInfo(1),
                    viewWidth,
                    viewHeight,
                    isProject: true,
                    show_svg: xmlString,
                    callback: function _cb(data) {
                        if (data && index) {
                            icons[index] = Object.assign(icons[index], data)
                            BuildFromJSON(icons);
                        }
                    }
                },
                width: 910,
                height: 685,
                dockClass: "edit-dialog"
            })
        });
    }

    function goDownload(fn) {
        var downLink = document.createElement('a');
        downLink.href = `/svg/download?fn=${fn}`;
        downLink.target = "#download"
        downLink.click()
    }

    function removeIco(fn, element) {
        require('assets/magix/helper').showConfirm("确定要删除些图标吗？", function _(a, b, c) {
            $.ajax({ method: 'POST', url: `/svg/remove`, data: { fn } }).then((res) => {
                if (res.succ) {
                    element.parentElement.parentElement.remove();
                    icons = icons.filter(function _i(ico) {
                        return ico.id != fn;
                    })
                }
            })
        }, function __(a, b, c) {
        });
    }

    function doCopy(target) {
        var copyTxtAra = document.querySelector("#text-copy"),
            text = target.parentElement.parentElement.querySelector(".icon-code").innerHTML.replace("0x", "");

        copyTxtAra.value = text;
        copyTxtAra.select();
        document.execCommand("copy");
        doRestoreShow(target, "✓成功")
    }

    function doRestoreShow(element, newText, durationMs) {
        var prevText = element.innerText;
        element.innerText = newText;
        setTimeout(function () {
            element.innerText = prevText;
        }, durationMs || 1000)
    }
});

seajs.use(["assets/magix/helper", 'magix', 'tmpl', 'buildIcons'], function (helper, Magix, tmpl, buildIcons) {
    //tmpl 为“编辑”弹窗需要
    Magix.boot({
        defaultPath: '/index',
        defaultView: 'app/index',
        rootId: 'root',
        error: (e) => {
            setTimeout(() => {
                throw e;
            }, 0);
        },
        exts: ["assets/magix/exts"]
    });

    $.ajaxSetup({
        complete: function (xhr, a, b, c) {

            if (xhr.status == 401) {
                logins.innerHTML = '<input name="verifycode" placeholder="登录码"/><button>登录</button>';
            } else if (xhr.status == 200) {
                logins.innerHTML = "🥳";
            }
        }
    });
    //加载项目列表
    $.ajax({
        url: '/svg/proj'
    }).then(function (res) {
        updateSelects(res)
    }, function (res, a) {
        console.log(res, a)
    })
    buildIcons.loadAndBuild(localStorage.getItem("currentPid"));//

    $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        options.url = "" + options.url;
    })

    var $$ = function (selector) { return document.querySelectorAll(selector) }
    //滚动时固定头部
    var headerNav = $$('.nav-header')[0];
    var icons = $$('#icons')[0];

    window.addEventListener('scroll', function (e) {
        if (window.scrollY > 0) {
            headerNav.classList.add('pofix');
            icons.classList.add('icon-fix')
        } else {
            headerNav.classList.remove('pofix')
            icons.classList.remove('icon-fix')
        }
    });

    //登录验证
    var loginForm = $$('#logins')[0];
    loginForm.addEventListener('submit', function (evt) {
        $.ajax({
            url: '/svg/login',
            method: 'post',
            data: { verifycode: this[0].value }
        }).then(function (res) {
            if (res.succ) {
                location.reload();
                loginForm.innerHTML = "🥳";
            }
        }, function _rej() {
            helper.showGlobalTip("登录失败")
        })
        evt.preventDefault();
    });
    //添加项目
    var addProjBtn = $$("#add-proj")[0],
        addProjOpt = $$('#add-proj-opt')[0];

    addProjBtn.addEventListener('click', function (e) {
        addProjOpt.style.display = "flex";
    });

    $$('#add-proj-opt')[0].addEventListener('submit', function (evt) {
        var projInfo = {};

        var fontname = (this.fontname.value || "").replace(/\s/g, "_");
        if (!checkFontnameOnly(fontname)) {//检查重复
            evt.preventDefault();
            return false;
        }

        for (let i = 0; i < this.length; i++) {
            var value = this[i].value;

            if (this[i].name == "fontname") {
                value = fontname;
            }
            if (this[i].name) {
                projInfo[this[i].name] = value;
                this[i].value = "";
            }
        }

        $.ajax({ url: '/svg/addProj', method: 'post', data: projInfo }).then(function _(projs) {

            var projSelect = document.querySelector('#projects');

            updateSelects(projs);
            addProjOpt.style.display = "";
            projSelect.selectedIndex = projs.length - 1;

        }, function rej() {
            alert("添加失败啦")
        })
        evt.preventDefault();
    });

    $$('#cancel-add-proj')[0].addEventListener('click', function (evt) {
        addProjOpt.style.display = "";
        evt.preventDefault();
    })

    //选择项目
    $$('#projects')[0].addEventListener('change', function (evt) {
        var vals = this.value.split(':');
        buildIcons.loadAndBuild(vals[0]);
        renewFontIcon(vals[1]);
        localStorage.setItem("currentPid", vals[0])
    });

    //图标颜色
    var st = $$('#cc-style')[0];
    var scinput = $$('#icon_color')[0];
    scinput.addEventListener('input', function (e) {
        setIconStyle({ color: this.value });
    });

    //图标大小
    var szinput = $$('#icon_size')[0];
    szinput.addEventListener('change', function (e) {
        setIconStyle({ size: this.value });
    });

    //搜索图标
    var seaTm, seainput = $$('#icon_search')[0];
    seainput.addEventListener("input", function (e) {
        var input = this;
        clearTimeout(seaTm);
        seaTm = setTimeout(function _() {
            buildIcons.filter(input.value);
        }, 600)

    });

    setIconStyle();
    function setIconStyle(a) {
        a = a || {};
        var color = a.color || localStorage.getItem('icon-color') || "#4180c3";
        var size = parseInt(a.size) || localStorage.getItem('icon-size') || 42;
        st.innerHTML = `.font-icon{color: ${color}; font-size: ${size}px; } :root {--theme-color: ${color};}`;
        localStorage.setItem('icon-size', size);
        localStorage.setItem('icon-color', color);
        scinput.value = color;
        szinput.value = size;
    }

    var upload = $$('#uploadinput')[0],
        exts = $$('#ext-icons')[0],
        uploadOpt = $$('#upload-svg-opt')[0],
        willUploads = [],
        maxUpSize = 20;
    //上传图标
    upload.addEventListener('change', function (evt) {

        let files = this.files,
            withExisting = 0,
            nameKeys = {};

        for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (file) {
                nameKeys[(file.name || "").replace(/\.svg/i, '')] = true;
            }
        }

        var checkedKeys = buildIcons.checkDupli(nameKeys);

        Read(0);

        function Read(index) {

            if (willUploads.length >= maxUpSize || files.length <= index) {
                return;
            }

            var file = files[index],
                FN = ((file || {}).name || "").replace(/\.svg/i, '');

            if (checkedKeys[FN] && file) {

                var FR = new FileReader();

                FR.onload = evt => {

                    try {
                        var svgDom = new DOMParser().parseFromString(evt.target.result, 'application/xml');
                        if (svgDom.firstElementChild.tagName.toUpperCase() !== 'SVG') {
                            throw 'ç'
                        }

                        exts.innerHTML += "<div class='upload-svg icon-edit'>" + evt.target.result + "</div>";
                        willUploads[index] = { index, name: FN, svg: evt.target.result };
                        //有要上传的图标时展开界面
                        uploadOpt.style.display = "flex";

                    } catch (e) {
                        alert(`${file.name}不是标准的svg文件`);
                    }

                    Read(index + 1);
                }
                FR.readAsText(file, 'utf-8');
            } else {
                Read(index + 1);
                !withExisting && helper.showGlobalTip({ content: '添加了与现有名称重复的图标，将不加入上传！', delay: 2500 });
                withExisting = true;
            }
        }

    });

    $$('#upload-cancel')[0].addEventListener('click', function () {
        willUploads = [];
        exts.innerHTML = '';
        uploadOpt.style.display = "";
    });

    $$('#upload-btn')[0].addEventListener('click', function () {
        var pid = currentProjInfo(0);
        var _this = this;
        _this.disabled = true;
        $.ajax({
            url: '/svg/upload',
            method: 'post',
            data: { icons: willUploads.filter(function _u(ico) { return !!(ico || {}).svg }), pid: pid }
        }).then(function (res) {
            if (res.succ) {
                location.reload();
            }
        }, function () {
            $$('#upload-cancel')[0].click();
            helper.showGlobalTip("上传失败");
            _this.disabled = false;
        });
    });
});


function renewFontIcon(name) {
    name = name || 'echat';
    var tm = Date.now();
    var fontTpl = `@font-face {
        font-family: echat;
        /* IE9*/
        src: url('./fonts/${name}.woff2?t=${tm}') format('woff2'),
            url('./fonts/${name}.woff?t=${tm}') format('woff'),
            /* chrome, firefox */
            url('./fonts/${name}.ttf?t=${tm}') format('truetype'),
            /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
            url('./fonts/${name}.svg?t=${tm}#echat') format('svg');
        /* iOS 4.1- */
    }`
    $('#font-style')[0].innerHTML = fontTpl;
}

function currentProjInfo(index) {
    return document.querySelector('#projects').value.split(":")[index];
}

function updateSelects(projs) {

    var projSelect = document.querySelector('#projects'),
        currentPid = localStorage.getItem("currentPid") || 1,
        selectOption;

    projSelect.innerHTML = projs.map(function (item) {
        if (currentPid == item.id) {
            selectOption = `${item.id}:${encodeURIComponent(item.fontname)}`;
            renewFontIcon(item.fontname);
        }
        return `<option value="${item.id}:${encodeURIComponent(item.fontname)}">${item.name}(${item.fontname})</option>`;
    }).join('');
    projSelect.value = selectOption;
}

function checkFontnameOnly(fontName = "") {
    var projSelect = document.querySelector('#projects'),
        opts = projSelect.options;

    for (let i = 0; i < opts.length; i++) {
        if (opts[i].innerHTML.indexOf(`(${fontName})`) > -1) {
            alert(`字体名与代码项目的重复`);
            return false;
        }
    }
    return true;
}