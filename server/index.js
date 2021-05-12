
var Express = require('express');
var { urlencoded } = require('body-parser');
var http = Express();
var fs = require('fs');
const builder = require('../svgIconBuilder');
const sqliteDB = require('./sqliteDB');

const SERVER_PORT = "8089",
    START_INDEX = 65535;

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

    const { rows } = await sqliteDB.queryAllSvgInfo();
    try {

        await builder({
            svgs: rows,
            outputFolder: `${__dirname}/../fonts`,
            fontTypes: ['ttf', 'eot', 'woff', 'woff2']
        })
        respone(resp, respRes(true));
    } catch (e) {
        respone(resp, respRes(false));
    }

});

http.post("/svg/upload", async function (req, resp) {
    const { body: { icons } = {} } = req;
    const { rows } = await sqliteDB.queryAllSvgInfo();
    rows.sort((a, b) => {//将图标以code大小顺序排序一下
        return a.code.localeCompare(b.code) > 0 ? 1 : -1
    });
    let code = Number(`0x${rows[0].code}`);

    for await (let svg of icons) {
        code = code - 1;
        sqliteDB.addSvg({ projectId: 1, ...svg, code: code.toString(16), });
    }
    respone(resp, respRes(true))
});

(async function () {//初始化sqlite3 数据库
    const dbInstance = await sqliteDB.initIconsDB();
    await sqliteDB.createIconTables(dbInstance);
})();

http.listen(SERVER_PORT, () => {
    console.log(`Server listening at http://localhost:${SERVER_PORT}`)
});


function respRes(bool) {
    return JSON.stringify({ succ: !!bool });
}
function respone(resp, res, code = 200,) {
    resp.writeHead(code).end(res);
}
