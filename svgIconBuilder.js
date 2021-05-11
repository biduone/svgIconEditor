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
module.exports = function SvgIconBuilder(config) {
    console.log(config.svgFolder, config.outputFolder)
    var projConfig = {
        name: 'echat',
        svgs: config.svgs,
        dest: config.outputFolder,
        supportTypes: config.fontTypes
    },
        builderPromise = collectionBuilder(projConfig);

    builderPromise.then(() => {
        buildFontFile(projConfig);
    }, (reason) => {
        console.log(reason);
    });

    return builderPromise;
}

/**
 * @param {promise} promise
 
function collBuilderLooper(promise,index) {
    promise.then(() => {
        console.log('succ');
        buildFontFile(projects[currentProjIndex]);
        currentProjIndex++;
        collBuilderLooper(collectionBuilder(projects[currentProjIndex]));
    }, (reason) => {
        console.error(reason);
        currentProjIndex++;
        collBuilderLooper(collectionBuilder(projects[currentProjIndex]));
    });
}
*/

function buildFontFile({ name, dest, supportTypes }) {

    var ttf = svg2ttf(fs.readFileSync(GetABSpath(`./iconCollection-${name || 'noname'}.svg`), 'utf8'), {});

    for (let i = 0; i < supportTypes.length; i++) {
        if (convertors[supportTypes[i]]) {
            fs.writeFileSync(`${dest}/${name || 'fonticon'}.${supportTypes[i]}`, convertors[supportTypes[i]](ttf.buffer));
        }
    }
}


function GetABSpath(path) {
    return [__dirname, path].join('/');
}