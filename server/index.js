
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
/**查询项目列表 */
http.get("/svg/proj", async function (req, resp) {

    const { err, rows } = await sqliteDB.queryProjects();

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});
/**添加项目列表 */
http.post("/svg/addProj", async function (req, resp) {

    const { body } = req;
    if (!body.name) {
        return respone(resp, respRes(false));
    }
    const { err, rows } = await sqliteDB.addProjects({ name: body.name, desc: body.desc, fontname: body.fontname });

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});


http.post("/svg/icons", async function (req, resp) {

    const { body } = req;
    const { err, rows } = await sqliteDB.queryIconsInfo(body.pid);

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});

http.all("/svg/get", async function (req, resp) {
    var fontId = req.query['fn'];
    if (!fontId) {
        return respone(resp, '');
    }
    const { rows } = await sqliteDB.querySingleIcon(fontId);

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows[0]));

});

http.post("/svg/save", async function (req, resp) {
    var { body } = req,
        fn = body['fn'],
        pid = body.pid,
        fileString = body['svgFile'];

    resp.setHeader("content-type", "application/json; charset=UTF-8")

    if (!fn || !fileString) {
        return respone(resp, respRes(false));
    }

    await sqliteDB.updateSvg(fn, fileString);

    const { rows: projs } = await sqliteDB.queryProjInfo(pid);
    const { rows } = await sqliteDB.queryAllSvgInfo(pid || 1);
    try {

        await builder({
            name: projs[0].fontname,
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
    const { body: { icons, pid } = {} } = req;
    const { rows } = await sqliteDB.queryAllSvgInfo();

    rows.sort((a, b) => {//将图标以code大小顺序排序一下
        return a.code.localeCompare(b.code) > 0 ? 1 : -1
    });

    let code = Number(`0x${rows[0].code}`);
    for await (let svg of icons) {
        code = code - 1;
        sqliteDB.addSvg({ projectId: pid || 1, ...svg, code: code.toString(16), });
    }

    try {
        const { rows } = await sqliteDB.queryProjInfo(pid);
        await builder({
            name: projs[0].fontname,
            svgs: rows,
            outputFolder: `${__dirname}/../fonts`,
            fontTypes: ['ttf', 'eot', 'woff', 'woff2']
        })
        respone(resp, respRes(true));
    } catch (e) {
        respone(resp, respRes(false));
    }
    respone(resp, respRes(true))
});

(async function () {//初始化sqlite3 数据库
    const dbInstance = await sqliteDB.initIconsDB();
    await sqliteDB.initProjectTable(dbInstance);
    await sqliteDB.initIconTable(dbInstance);
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
