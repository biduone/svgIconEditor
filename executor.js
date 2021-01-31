const builder = require('./svgIconBuilder');
builder({
    svgFolder: `${__dirname}/svgs`,
    outputFolder: `${__dirname}/../../`,
    fontTypes: ['ttf', 'eot', 'woff', 'woff2']
})