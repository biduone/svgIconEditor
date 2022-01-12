//file:test.js
const sqlite3 = require('sqlite3'),
    Utils = require("./Utils"),
    {
        DBConf: {
            DBName,
            ProjTableName,
            IconTableName
        }
    } = require("./serverConfig");

let dbInstance;

exports.queryProjects = async function (db) {
    return await runSQL(`select id, name, fontname, desc from ${ProjTableName}`);
}

exports.queryProjInfo = async function (pid) {
    return await runSQL(`select id, name,fontname, desc from ${ProjTableName} where id=?`, [pid]);
}
/**
 * 
 * @param {Object} proj 
 * @param {String} proj.name 
 * @param {String} proj.fontname 
 * @param {String} proj.desc
 * @param {*} db 
 */
exports.addProjects = async function (proj, db) {
    await runSQL(`insert into ${ProjTableName} (name, fontname, desc) values (?,?,?)`, [proj.name, proj.fontname, proj.desc]);
    return await exports.queryProjects();
}

exports.querySingleIcon = async function (fontId, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).all(`select projectId, id,code,name,svg from ${IconTableName} where id=?`, [fontId], callback);
    return promise;
}

exports.queryIconsInfo = function (projectId, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).all(`select id, code, name from ${IconTableName} where projectId=? and del is null`, [projectId || 1], callback);
    return promise;
}

exports.queryAllSvgInfo = function (projectId, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).all(`select id, code, name, svg from ${IconTableName} where projectId=? and del is null`, [projectId], callback);
    return promise;
}
/** 添加svg
 * @param {Object} svg
 * @param {string} svg.name
 * @param {string} svg.code
 * @param {string} svg.svg
 */
exports.addSvg = function (svg, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).run(`insert into ${IconTableName} (projectId,name,code,svg,updatetime) values(?,?,?,?,?)`,
        [svg.projectId || 0, svg.name, svg.code, svg.svg, Date.now()], callback);

    return promise;
}

exports.updateSvg = function (fontId, name, svg) {

    let chunks = [], values = [], { callback, promise } = DBPromise();

    if (typeof name != 'undefined') {
        chunks.push("name=?")
        values.push(name)
    }

    if (typeof svg != 'undefined') {
        chunks.push("svg=?")
        values.push(svg)
    }
    values.push(fontId);

    dbInstance.run(`UPDATE ${IconTableName} set ${chunks.join(",")} where id=?`, values, callback);

    return promise;
}

exports.delSvg = function (fontId, operatorName) {

    let { callback, promise } = DBPromise();

    dbInstance.run(`UPDATE ${IconTableName} set del=? where id=?`, [`${operatorName}-${Date.now()}`, fontId], callback);

    return promise;
}
/**
 * 初始创建数据库
 * @returns {promise}
 */
exports.initIconTable = function (db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).run(`CREATE TABLE IF NOT EXISTS ${IconTableName} (
        id Integer primary key autoincrement, 
        projectId varchar(100),
        name varchar(255),
        code varchar(512),
        svg TEXT,
        updatetime Integer,
        del varchar(512)
    )`, callback);
    return promise;

}

/**
 * 初始创建数据库
 * @returns {promise}
 */
exports.initProjectTable = function (db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).run(`CREATE TABLE IF NOT EXISTS ${ProjTableName} (
        id Integer primary key autoincrement, 
        name varchar(255),
        fontname varchar(255) UNIQUE,
        desc varchar(512),
        updatetime Integer
    )`, async (a, b) => {
        const { rows } = await runSQL(`select count(id) as count from ${ProjTableName}`);
        if (!rows || !rows[0] || rows[0].count === 0) {
            const { err, rows } = await runSQL(`insert into ${ProjTableName} (id,name,fontname,desc,updatetime) 
                values (1,'Echat','echat','Echat Staff Client',${Date.now()})`);

            if (err) {
                throw "Create project table failure"
            }
            callback(err, rows);
        }

    });
    return promise;

}

exports.initIconsDB = function (dbName) {
    console.log("init Icon Sqlit db");
    let Defer = Utils.defer();
    dbInstance = new sqlite3.Database(dbName || `${__dirname}/${DBName}`, function (a, b, c) {
        if (a === null) {
            Defer.resolve(dbInstance);
        } else {
            Defer.reject(a);
        }
    });

    return Defer.promise
}
/**
 * 
 * @param {string} sql 
 * @param {string[]|number[]} params 
 * @param {Object=} db 
 */
function runSQL(sql, params, db) {

    let { callback, promise } = DBPromise();
    (db || dbInstance).all(sql, params, callback);
    return promise;
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