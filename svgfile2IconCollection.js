/**
 * 此功能是将整个项目的res/fonts/svgs中的svg文件集合成一个fontface，提供给svgTottf来为字体文件
 */
const fs = require('fs'),
    OS = require('os'),
    CP = require('child_process'),
    { Readable } = require('stream'),
    SVGIcons2SVGFontStream = require('svgicons2svgfont');
/**
 * @param {Object} project 配置参数
 * @param {String} project.name 字体图标的，字体名
 * @param {Object[]} project.svgs svg字体图集合
 * @param {String} project.svgs.code svg字体图集合
 * @param {String} project.svgs.svg svg字体图集合
 */
module.exports = function svgCollectionBuilder(project) {

    const defer = Defer(),
        fontStream = new SVGIcons2SVGFontStream({
            fontName: project.name,
            normalize: true,
            fontHeight: 1024,
        });

    // Setting the font destination
    let streamRes = false,
        iconsSvg = [];
    //fontStream.pipe(fs.createWriteStream(GetABSpath(`./iconCollection-${project.name}.svg`)))
    fontStream.on('finish', function () {
        console.log(`${project.name} Font successfully created!`);
        streamRes = true;
    }).on('error', function (err) {
        console.log(err);
    }).on('data', function (chunk, a, c) {
        const glyph = chunk.toString();
        iconsSvg.push(glyph)
    }).on('close', (cc) => {
        setTimeout(function () {
            if (streamRes) {
                defer.resolve(fontStream);
            } else {
                defer.reject();
            }
            //openIconPageToChrome();
        }, 300);
    });

    var svgs = project.svgs;
    if (svgs.length) {

        let glyphMetadata;
        for (let i = 0, len = svgs.length; i < len; i++) {
            let svg = svgs[i];
            // Writing glyphs
            glyphMetadata = {
                unicode: [String.fromCharCode(`0x${svg.code}`)],
                name: `${svg.code}_${svg.name}`,
                code: svg.code,
            };
            if (!svg.code) {
                continue;
            }

            const glyph = Readable.from(Buffer.from(svg.svg, "utf-8").toString());
            //fs.createReadStream(Buffer.from(svg.svg, "utf-8"));
            glyph.metadata = glyphMetadata;
            fontStream.write(glyph);
        }

    } else {
        setTimeout(() => {
            defer.reject(`No svg file in directory :=> ${project.svgsPath}`);
        }, 400);
    }
    // Do not forget to end the stream
    fontStream.end(function (a, b, c) {
        console.log(Date.now(), "Collection created")
        setTimeout(function () {
            if (streamRes) {
                defer.resolve(iconsSvg);
            } else {
                defer.reject();
            }
            //openIconPageToChrome();
        }, 300);
    });
    return defer.promise;
};

function GetABSpath(path) {
    return [__dirname, path].join('/');
}


/**创建一个defer*/
function Defer() {
    function PromiseMaker() {
        let resolver,
            rejecter,
            promise = new Promise(function (resolve, reject) {
                resolver = resolve;
                rejecter = reject;
            });

        this.promise = promise;
        this.resolve = (result) => {
            resolver(result);
        };
        this.reject = (reason) => {
            rejecter(reason);
        };

        /**catch warn */
        promise.then(() => { }, () => { });
        return this;
    }
    const PM = new PromiseMaker();
    return PM;
}

function openIconPageToChrome() {
    var currentPath = __dirname;
    if (OS.platform == 'darwin') {
        CP.exec(`open -a "Google Chrome" file://${currentPath}/index.html`);
    } else if (OS.platform == 'win32') {
        CP.exec(`start chrome file://${currentPath}/index.html`)
    }

}
