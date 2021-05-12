let fs = require('fs'),
    svg2ttf = require('svg2ttf'),
    ttf2woff = require('ttf2woff2'),
    ttf2woff2 = require('ttf2woff2'),
    ttf2eot = require('ttf2eot'),
    collectionBuilder = require('./svgfile2IconCollection'),
    convertors = { ttf: (buf) => Buffer.from(buf), eot: ttf2eot, woff: ttf2woff, woff2: ttf2woff2 };

/**
 * 
 * @param {Object} config 
 * @param {String} config.domain 'localhost',
 * @param {String} config.port 8089,
 * @param {String} config.prefixPath 'svgedit',
 * @param {Object[]]} config.svgs 'svgs',
 * @param {String} config.outputFolder 'fonts',
 * @param {String[]} config.fontTypes ['ttf', 'eot', 'woff', 'woff2']
 */
module.exports = async function SvgIconBuilder(config) {
    console.log(config.outputFolder, config.fontTypes)
    var projConfig = {
        name: 'echat',
        svgs: config.svgs,
        dest: config.outputFolder,
        supportTypes: config.fontTypes
    },
        fontStream = await collectionBuilder(projConfig);

    return buildFontFile(projConfig, fontStream);


}

function buildFontFile({ name, dest, supportTypes }, fonts) {

    var ttf = svg2ttf(fonts.join(''), {});

    for (let i = 0; i < supportTypes.length; i++) {
        if (convertors[supportTypes[i]]) {
            fs.writeFileSync(`${dest}/${name || 'fonticon'}.${supportTypes[i]}`, convertors[supportTypes[i]](ttf.buffer));
        }
    }

    return true;
}
