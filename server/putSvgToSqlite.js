const FS = require('fs');
const iconDb = require('./sqliteDB');
const Utils = require('./Utils');

let svgs = [];

const files = FS.readdirSync('./svgs');

for (let i = 0, len = files.length; i < len; i++) {
    const cnt = FS.readFileSync(`./svgs/${files[i]}`, { encoding: 'utf-8' }) || '';
    if (cnt.startsWith('<svg')) {
        const ns = files[i].split('$$');
        svgs.push({ projectId: 1, code: ns[0], name: ns[1].replace(/\.svg/i, ''), content: cnt })
    } else {
        console.log(files[i])
    }
}

svgs.sort((a, b) => {//将图标以code大小顺序排序一下
    return a.code.localeCompare(b.code) > 0 ? 1 : -1
});

(async function () {
    const db = await iconDb.initIconsDB();
    await iconDb.createIconTables();

    for await (let svg of svgs) {
        const res = await iconDb.addSvg(svg);
    }

    db.close();

})();
