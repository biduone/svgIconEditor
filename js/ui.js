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

    var iconContainer = document.getElementById('icons');
    module.exports = function cloneIcon(pid) {
        //加载图标(默认第一个项目)
        $.ajax({
            url: '/svg/icons',
            method: 'post',
            data: { pid: pid }
        }).then(function (res) {

            var frame = document.createDocumentFragment();

            res.sort((a, b) => {//将图标以code大小顺序排序一下
                return a.code.localeCompare(b.code) > 0 ? 1 : -1
            });

            iconContainer.innerHTML = '';
            for (var i = 0; i < res.length; i++) {
                frame.appendChild(iconBuilder(res[i]));
            }
            iconContainer.appendChild(frame)
        });
    }

    var iconTpl = document.getElementsByClassName('icon-pt')[0];
    function iconBuilder(res) {
        var { code, name, id } = res,
            icon = iconTpl.cloneNode(true);

        icon.querySelector('.font-icon').innerHTML = String.fromCharCode(`0x${code}`);
        icon.querySelector('.icon-name').innerHTML = name;
        icon.querySelector('.icon-code').innerHTML = `0x${code}`;
        icon.querySelector('.icon-html').innerText = `&#x${code};`;

        /** 编辑 */
        var editBtn = icon.querySelector('.icon-edit');
        editBtn.setAttribute('fn', id);
        return icon;
    }


    iconContainer.addEventListener('click', function (e) {

        var fn = e.target.getAttribute('fn');
        if (!fn) return;

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
                    show_svg: xmlString
                },
                width: 910,
                height: 685,
                dockClass: "edit-dialog"
            })
        });

    });

});

seajs.use(['buildIcons', "jquery"], function (buildIcons, jquery) {
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
    //添加项目
    var addProjBtn = $$("#add-proj")[0],
        addProjOpt = $$('#add-proj-opt')[0];

    addProjBtn.addEventListener('click', function (e) {
        addProjOpt.style.display = "flex";
    });

    $$('#add-proj-opt')[0].addEventListener('submit', function (evt) {
        var projInfo = {};
        for (let i = 0; i < this.length; i++) {
            if (this[i].name) {
                projInfo[this[i].name] = this[i].value;
            }
        }
        $.ajax({ url: '/svg/addProj', method: 'post', data: projInfo })
        evt.preventDefault();
    });

    $$('#cancel-add-proj')[0].addEventListener('click', function (evt) {
        addProjOpt.style.display = "";
        evt.preventDefault();
    })

    //选择项目
    $$('#projects')[0].addEventListener('change', function (evt) {
        buildIcons(this.value.split(':')[0]);
        renewFontIcon(this.value.split(':')[1]);
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

    setIconStyle();
    function setIconStyle(a) {
        a = a || {};
        var color = a.color || localStorage.getItem('icon-color') || "#39ca39";
        var size = parseInt(a.size) || localStorage.getItem('icon-size') || 42;
        st.innerHTML = `.font-icon{color: ${color}; font-size: ${size}px; }`;
        localStorage.setItem('icon-size', size);
        localStorage.setItem('icon-color', color);
        scinput.value = color;
        szinput.value = size;
    }

    var upload = $$('#uploadinput')[0],
        exts = $$('#ext-icons')[0],
        uploadOpt = $$('#upload-svg-opt')[0],
        willUploads = [];
    //上传图标
    upload.addEventListener('change', function (evt) {

        if (willUploads.length == 8) {
            return alert('一次上传最多8个');
        }

        for (let i = 0; i < this.files.length; i++) {
            Read(this.files[i])
        }
        uploadOpt.style.display = "flex";


        function Read(file) {
            var FR = new FileReader();
            FR.onload = evt => {
                try {
                    var svgDom = new DOMParser().parseFromString(evt.target.result, 'application/xml');
                    if (svgDom.firstElementChild.tagName.toUpperCase() !== 'SVG') {
                        throw 'ç'
                    }
                } catch (e) {
                    return alert("不是标准的svg文件");
                }

                if (willUploads.length < 8) {
                    exts.innerHTML += "<div class='upload-svg'>" + evt.target.result + "</div>";
                    willUploads.push({ name: file.name.replace(/\.svg/i, ''), svg: evt.target.result });
                }
            }
            FR.readAsText(file, 'utf-8');
        }
    });

    $$('#upload-cancel')[0].addEventListener('click', function () {
        willUploads = [];
        exts.innerHTML = '';
        uploadOpt.style.display = "";
    });

    $$('#upload-btn')[0].addEventListener('click', function () {
        var pid = currentProjInfo(0);
        $.ajax({
            url: '/svg/upload',
            method: 'post',
            data: { icons: willUploads, pid: pid }
        }).then(function (e) {

        }, function () {
            $$('#upload-cancel')[0].click();
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