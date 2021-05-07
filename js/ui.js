window.$ = function (selector) { return document.querySelectorAll(selector) }

document.addEventListener('DOMContentLoaded', function (e) {
    //滚动时固定头部
    var headerNav = $('.project-opts')[0];
    var icons = $('#icons')[0];

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
    var st = $('#cc-style')[0];
    var scinput = $('#icon_color')[0];
    scinput.addEventListener('input', function (e) {
        setIconStyle({ color: this.value });
    });

    //图标大小
    var szinput = $('#icon_size')[0];
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
});

