const fs = require('fs'),
    svg2ttf = require('svg2ttf'),
    ttf2woff = require('ttf2woff2'),
    ttf2woff2 = require('ttf2woff2'),
    ttf2eot = require('ttf2eot'),
    collectionBuilder = require('./svgfile2IconCollection'),
    supportTypes = ['ttf', 'eot',  'woff', 'woff2'],
    convertors = { ttf: (buf) => new global.Buffer(buf), eot: ttf2eot, woff: ttf2woff, woff2: ttf2woff2 },
    projects = [
        {
            name: 'echat',
            svgsPath: './svgs',
            dest: './fonts/echat'
        }
    ];

let i = 0;
for (; i < projects.length; i++) {
    let pcfg = projects[i];
    collectionBuilder(pcfg).then(() => {
        buildFontFile(pcfg);
    }, (reason) => {
        console.log(reason);
    });
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

function buildFontFile(fontCfg) {

    var ttf = svg2ttf(fs.readFileSync(GetABSpath(`./fonts/iconCollection-${fontCfg.name}.svg`), 'utf8'), {});

    for (let i = 0; i < supportTypes.length; i++) {
        if (convertors[supportTypes[i]]) {
            fs.writeFileSync(GetABSpath(`${fontCfg.dest}.${supportTypes[i]}`), convertors[supportTypes[i]](ttf.buffer));
        }
    }
}


function GetABSpath(path) {
    return [__dirname, path].join('/');
}