
var Express = require('express');
var { urlencoded } = require('body-parser');
var http = Express();
var fs = require('fs');
const builder = require('../svgIconBuilder');

const SERVER_PORT = "8089";

http.use(urlencoded({
    extended: true
}));

http.all("/svg/get", function (req, resp, params) {
    var fn = req.query['fn'];
    if (!fn) {
        return respone(resp, '');
    }
    svgFile = fs.readFileSync(GetSvgFolder(fn), { encoding: 'utf-8' });

    respone(resp, svgFile);

});

http.post("/svg/save", function (req, resp, params) {
    var body = req.body,
        fn = body['fn'],
        fileString = body['svgFile'];

    resp.setHeader("content-type", "application/json; charset=UTF-8")

    if (!fn || !fileString) {
        return respone(resp, respRes(false));
    }

    fs.writeFileSync(GetSvgFolder(fn), fileString, { encoding: 'utf-8' });

    builder({
        svgFolder: `${__dirname}/../svgs`,
        outputFolder: `${__dirname}/../fonts`,
        fontTypes: ['ttf', 'eot', 'woff', 'woff2']
    }).then((res) => {
        respone(resp, respRes(true));
    }, (err) => {
        respone(resp, respRes(false));
    })

});

http.post("/svg/upload", function (req, resp) {
    debugger
})

function respRes(bool) {
    return JSON.stringify({ succ: !!bool });
}
function respone(resp, res, code = 200,) {
    resp.writeHead(code).end(res);
}

http.listen(SERVER_PORT, () => {
    console.log(`Server listening at http://localhost:${SERVER_PORT}`)
});

function GetSvgFolder(fileName) {
    return `${__dirname}/../svgs/${fileName}`;
}