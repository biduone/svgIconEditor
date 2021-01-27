var http = require('http');
var fs = require('fs');
var URL = require('url');


http.createServer(function (req, resp) {
    // 解析请求，包括文件名
    var fullUrl = `http://${req.headers.host}${req.url}`,
        reqInfo = URL.parse(fullUrl),
        params = new URL.URLSearchParams(reqInfo.search);

    if (req.method === 'OPTIONS') {
        resp.setHeader('Access-Control-Allow-Headers', '_csrf,Content-Type');
    }
    resp.setHeader('Access-Control-Allow-Origin', '*');

    requests[reqInfo.pathname](req, resp, params);
    resp.write
}).listen("8089");

const requests = {
    /**
     * @param {IncomingMessage} req 
     * @param {ServerResponse} resp 
     * @param {URLSearchParams} params 
     */
    "/getsvg": function (req, resp, params) {
        var fn = params.get('fn'),
            svgFile = fs.readFileSync(GetSvgFolder(fn), { encoding: 'utf-8' });

        resp.writeHead(200).end(svgFile);

    },
    "/saveSvg": function (req, resp, params) {
        var fn = params.get('fn'),
            fileString = params.get('svgFile');

        fs.writeFileSync(GetSvgFolder(fn), fileString, { encoding: 'utf-8' });

        resp.writeHead(200).end(`{succ:true}`);
    }
}

function GetSvgFolder(fileName) {
    return `${__dirname}/../svgs/${fileName}`;
}