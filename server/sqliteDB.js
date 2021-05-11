//file:test.js
const sqlite3 = require('sqlite3'),
    Utils = require("./Utils"),
    tableName = "svgs";

let dbInstance;

exports.querySingleIcon = async function (fontId, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).all(`select svg from ${tableName} where id=?`, [fontId], callback);
    return promise;
}

exports.queryIconsInfo = async function (projectId = 1, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).all(`select id, code, name from ${tableName} where projectId=?`, [projectId], callback);
    return promise;
}
/** 添加svg */
exports.addSvg = function (svg, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).run(`insert into ${tableName} (projectId,name,code,svg,updatetime) values(?,?,?,?,?)`,
        [svg.projectId || 0, svg.name, svg.code, svg.content, Date.now()], callback);

    return promise;
}

exports.updateSvg = function (fontId, svg) {

    let { callback, promise } = DBPromise();

    dbInstance.run(`UPDATE ${tableName} set svg=? where id=?`, [svg, fontId], callback);

    return promise;
}
/**
 * 初始创建数据库
 * @returns {promise}
 */
exports.createIconTables = function (db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).run(`CREATE TABLE IF NOT EXISTS ${tableName} (
        id Integer primary key autoincrement, 
        projectId varchar(100),
        name varchar(255),
        code varchar(512),
        svg TEXT,
        updatetime Integer
    )`, callback);
    return promise;

}


exports.initIconsDB = function (dbName) {
    console.log("init Icon Sqlit db");
    let Defer = Utils.defer();
    dbInstance = new sqlite3.Database(dbName || `${__dirname}/font_icons.sqlite3`, function (a, b, c) {
        if (a === null) {
            Defer.resolve(dbInstance);
        } else {
            Defer.reject(a);
        }
    });

    return Defer.promise
}

function DBPromise() {
    let Proms = Utils.defer();
    return {
        callback: function (err, rows, ext) {
            if (err === null) {
                Proms.resolve({ err, rows, ext });
            } else {
                Proms.reject(err);
            }
        },
        promise: Proms.promise
    }

}