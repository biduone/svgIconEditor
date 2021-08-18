const crypto = require("crypto");
const vcs = require('./verifycode.json')
const secret = 'echat';

exports.checkCrypto = function (str) {
    const hash = exports.encrypt(str);
    return vcs[hash]
}

exports.encrypt = function (str) {
    return crypto.createHmac('sha256', secret).update(str).digest('base64');
}

const us = {
    "zty_1989ABC": true,
    "@2021lpechat": true,
    "tpp@echat2021": true,
    "pry@2021echat": true,
    "prod_echat$2021": true,
    "prod_echat2$2021": true
}

for (let u in us) {
    console.log(`"${exports.encrypt(u)}":true`);
}
