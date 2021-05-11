
var Express = require('express');
var { urlencoded } = require('body-parser');
var http = Express();
var fs = require('fs');
const builder = require('../svgIconBuilder');
const sqliteDB = require('./sqliteDB');

const SERVER_PORT = "8089";

http.use(urlencoded({
    extended: true
}));

http.get("/svg/icons", async function (req, resp) {

    const { err, rows } = await sqliteDB.queryIconsInfo();

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});

http.all("/svg/get", async function (req, resp) {
    var fontId = req.query['fn'];
    if (!fontId) {
        return respone(resp, '');
    }
    const { rows } = await sqliteDB.querySingleIcon(fontId);

    respone(resp, rows[0].svg);

});

http.post("/svg/save", async function (req, resp) {
    var body = req.body,
        fn = body['fn'],
        fileString = body['svgFile'];

    resp.setHeader("content-type", "application/json; charset=UTF-8")

    if (!fn || !fileString) {
        return respone(resp, respRes(false));
    }

    await sqliteDB.updateSvg(fn, fileString);

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
    const { body = {} } = req;

})

function respRes(bool) {
    return JSON.stringify({ succ: !!bool });
}
function respone(resp, res, code = 200,) {
    resp.writeHead(code).end(res);
}

(async function () {
    const dbInstance = await sqliteDB.initIconsDB();
    const creRes = await sqliteDB.createIconTables(dbInstance);

})();

http.listen(SERVER_PORT, () => {
    console.log(`Server listening at http://localhost:${SERVER_PORT}`)
});

function GetSvgFolder(fileName) {
    return `${__dirname}/../svgs/${fileName}`;
}