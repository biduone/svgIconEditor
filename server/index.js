
var Express = require('express');
var { urlencoded } = require('body-parser');
var cookieParser = require('cookie-parser')

const builder = require('../svgIconBuilder');
const sqliteDB = require('./sqliteDB');
const cryptoUtil = require("./crypto");
const accouts = require('./verifycode.json');
const { Config: {
    SERVER_PORT,
    EXPIRATION,
    SERVER_PREFIX,
    VERIFY_COOKIE
} } = require('./serverConfig');


var loginSessions = {};
var http = Express();
http.use(urlencoded({
    extended: true
}));
http.use(cookieParser());
//登录拦截
http.use(function (req, resp, next) {

    const { cookies } = req,
        verifyCode = cookies[VERIFY_COOKIE] || '';

    if (accouts[verifyCode]) {
        //清除登录过期的
        if (loginSessions[verifyCode] && (Date.now() - loginSessions[verifyCode]) > EXPIRATION * 100) {
            resp.clearCookie(VERIFY_COOKIE);
            respone(resp, '', 401);
            return;
        }
        //更新登录时间
        loginSessions[verifyCode] = Date.now();
        next();
    } else if (decideUrl("/svg/login") === req.url || decideUrl("/svg/iconsWithContent") === req.url) {
        //跳过登录请求
        next();
    } else {//没有登录的返回401
        respone(resp, '', 401);
        //throw "Not logged in";
    }
});

/**添加项目列表 */
http.post(decideUrl("/svg/login"), async function (req, resp) {
    resp.setHeader("content-type", "application/json; charset=UTF-8");

    var { body } = req;
    var successful = cryptoUtil.checkCrypto(body.verifycode),
        cryptKey = cryptoUtil.encrypt(body.verifycode);

    if (body.verifycode && successful) {
        resp.cookie(VERIFY_COOKIE, cryptKey);
        //更新登录时间
        loginSessions[cryptKey] = Date.now();
        respone(resp, respRes(true));
    } else {
        respone(resp, respRes(false));
    }

});

/**查询项目列表 */
http.get(decideUrl("/svg/proj"), async function (req, resp) {

    const { err, rows } = await sqliteDB.queryProjects();

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});
/**添加项目列表 */
http.post(decideUrl("/svg/addProj"), async function (req, resp) {

    const { body } = req;
    if (!body.name) {
        return respone(resp, respRes(false));
    }
    const { err, rows } = await sqliteDB.addProjects({ name: body.name, desc: body.desc, fontname: body.fontname });

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});

/** 页面上读取svg信息来显示 */
http.post(decideUrl("/svg/icons"), async function (req, resp) {

    const { body } = req;
    const { err, rows } = await sqliteDB.queryIconsInfo(body.pid);

    rows.sort((a, b) => {//将图标以code大小顺序排序一下
        return a.code.localeCompare(b.code) > 0 ? 1 : -1
    });

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});

/** 提供给开发者拉取svg列表 */
http.post(decideUrl("/svg/iconsWithContent"), async function (req, resp) {

    const { body } = req;
    if (!accouts[body.verifycode]) {
        return respone(resp, '', 413);
    }
    const { err, rows } = await sqliteDB.queryAllSvgInfo(body.pid || 1);

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows));
});
/**单个svg */
http.get(decideUrl("/svg/get"), async function (req, resp) {
    var fontId = req.query['fn'];
    if (!fontId) {
        return respone(resp, '');
    }
    const { rows } = await sqliteDB.querySingleIcon(fontId);

    resp.setHeader("content-type", "application/json; charset=UTF-8");
    respone(resp, JSON.stringify(rows[0]));

});
/**保存修改 */
http.post(decideUrl("/svg/save"), async function (req, resp) {
    var { body } = req,
        fn = body['fn'],
        pid = body.pid,
        name = body.name,
        fileString = body['svgFile'];

    resp.setHeader("content-type", "application/json; charset=UTF-8")

    if (!fn || !fileString) {
        return respone(resp, respRes(false));
    }

    await sqliteDB.updateSvg(fn, name, fileString);

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

/**保存修改 */
http.post(decideUrl("/svg/remove"), async function (req, resp) {
    var { body: { fn: fontId } } = req;
    if (!fontId) {
        return respone(resp, respRes(false));
    }
    const res = await sqliteDB.delSvg(fontId);
    RespToJson(resp);
    return respone(resp, respRes(!res.err));
});
/**上传新svg文件 */
http.post(decideUrl("/svg/upload"), async function (req, resp) {
    const { body: { icons, pid } = {} } = req;
    const { rows } = await sqliteDB.queryIconsInfo(pid);

    rows.sort((a, b) => {//将图标以code大小顺序排序一下
        return a.code.localeCompare(b.code) > 0 ? 1 : -1
    });

    let latestIcon = rows[0];
    if (!latestIcon) {
        latestIcon = { code: "efff" };
    }

    let code = Number(`0x${latestIcon.code}`);
    for await (let svg of icons) {
        if (svg && svg.svg) {
            code = code - 1;
            sqliteDB.addSvg({ projectId: pid || 1, ...svg, code: code.toString(16), });
        }
    }

    resp.setHeader("content-type", "application/json; charset=UTF-8")
    try {
        const { rows: projInfo } = await sqliteDB.queryProjInfo(pid);
        const { rows: svgIcons } = await sqliteDB.queryAllSvgInfo(pid);

        await builder({
            name: projInfo[0].fontname,
            svgs: svgIcons,
            outputFolder: `${__dirname}/../fonts`,
            fontTypes: ['ttf', 'eot', 'woff', 'woff2']
        })
        respone(resp, respRes(true));
    } catch (e) {
        respone(resp, respRes(false));
    }
});

/**上传新svg文件 */
http.get(decideUrl("/svg/download"), async function (req, resp) {
    var fontId = req.query['fn'];
    if (!fontId) {
        return respone(resp, respRes(false));
    }

    const { rows } = await sqliteDB.querySingleIcon(fontId);
    const icon = rows[0];

    if (!icon) {
        return respone(resp, respRes(false));
    }

    resp.setHeader("content-type", "application/octet-stream");
    resp.setHeader("Content-Disposition", "attachment;filename=" + encodeURIComponent(`${icon.code}$${icon.name}.svg`));
    resp.setHeader("Content-Length", icon.svg.length);//设置内容长度  

    let index = 0;
    while (index < icon.svg.length) {
        resp.write(icon.svg.substring(index, index + 2048), "utf-8");
        index += 2048;
    }

    resp.end(function _(a, b) {
        console.log(a, b)
    })

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

function RespToJson(resp) {
    resp.setHeader("content-type", "application/json; charset=UTF-8");
}

function decideUrl(serverUrl) {
    return `${SERVER_PREFIX}${serverUrl}`;
}

var replaceWord = { 'Y': 'm', '=': "J", 'Z': "_" };
function encodeVC(code = "") {

    code = btoa(code || "");
    for (let k in replaceWord) {
        code = code.replace(k, replaceWord[k]);
    }
    console.log("encodeVC", code)
    return code;
}

function decodeVC(code) {
    code = code || "";
    for (let k in replaceWord) {
        code = code.replace(replaceWord[k], k);
    }
    console.log("decodeVC", code)
    return atob(code);
}

if (typeof btoa === 'undefined') {
    global.btoa = function (str) {
        return Buffer.from(str, 'utf-8').toString('base64');
    };
}

if (typeof atob === 'undefined') {
    global.atob = function (b64Encoded) {
        return Buffer.from(b64Encoded, 'base64').toString();
    };
}