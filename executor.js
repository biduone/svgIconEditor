const builder = require('./svgIconBuilder');
builder({
    svgFolder: `${__dirname}/svgs`,
    outputFolder: `${__dirname}/fonts`,
    fontTypes: ['ttf', 'eot', 'woff', 'woff2']
})