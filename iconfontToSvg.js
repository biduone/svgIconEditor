/**(iconfont_echatconfig  阿里iconfont的detail.json中的数据)
 * 此功能是将 阿里iconfont接口中的icons数据的转为单个的svg文件
 * svg文件名字规则为： ${16制code}$${图标的描述}.svg ; 如：e635$$加载.svg，表示这是个“加载”图标，字体码是e635(不同用法&#xe635; 或 \e635 )
 * 
 */
const fs = require('fs'),
    svgs = require('./fonts/iconfont_echatconfig').data.icons;

let unicode = '',
    svgName = '',
    svgPath = '';
console.log(svgs.length)
for (let i = 0; i < svgs.length; i++) {

    if (!svgs[i].unicode || !svgs[i].show_svg) {
        continue;
    }
    unicode = Number(svgs[i].unicode).toString(16);
    svgName = [unicode, svgs[i].name || 'noname'].join('$$');
    svgPath = ['./svgs/', svgName, '.svg'].join('');
    fs.writeFile(svgPath, svgs[i].show_svg, { encoding: 'utf8' }, () => true);
}

