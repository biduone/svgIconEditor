

document.addEventListener('DOMContentLoaded', function (e) {
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
        willUploads = [];

    upload.addEventListener('change', function (evt) {

        if (willUploads.length == 8) {
            return alert('一次上传最多8个');
        }

        for (let i = 0; i < this.files.length; i++) {
            Read(this.files[i])
        }

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
                    willUploads.push({ name: file.name, text: evt.target.result });
                }
            }
            FR.readAsText(file, 'utf-8');
        }
    });
    $$('#upload-cancel')[0].addEventListener('click', function () {
        willUploads = [];
        exts.innerHTML = '';
    });
    $$('#upload-btn')[0].addEventListener('click', function () {
        var fileMap = willUploads.reduce(function (prevs, item) {
            prevs[item.name] = item.text;
            return prevs;
        }, {});

        $.ajax({
            url: '/svg/upload',
            method: 'post',
            data: fileMap
        })
    });
});


function renewFontIcon() {
    var tm = Date.now();
    var fontTpl = `@font-face {
        font-family: echat;
        src: url('./fonts/echat.eot?t=${tm}');
        /* IE9*/
        src: url('./fonts/echat.eot?t=${tm}#iefix') format('embedded-opentype'),
            /* IE6-IE8 */
            url('./fonts/echat.woff?t=${tm}') format('woff'),
            /* chrome, firefox */
            url('./fonts/echat.ttf?t=${tm}') format('truetype'),
            /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
            url('./fonts/echat.svg?t=${tm}#echat') format('svg');
        /* iOS 4.1- */
    }`
    $('#font-style')[0].innerHTML = fontTpl;
}