/*
    markdown实时预览(热加载)
    node index.js [mdfile] [port]
    mdfile: 指定md文件, 必选
    port: 服务端口, 可选, 默认8888
 */
const http = require('http');
const fs = require('fs');
const open = require("open");
const md = require('markdown-it')();

const params = process.argv.splice(2);

if (!params[0]) {
    console.log('must specify a md file.');
    console.log('必须指定一个md文件。');
    return;
}
// 指定md文件
const mdFile = params[0];

// 指定监听端口
const port = params[1] || 8888;

// 换行符 process.platform
const lineBreak = '\n';

http.createServer(function(request, response){
    // 预览地址
    if (request.url === '/') {
        fs.readFile('index.html', (err, data) => {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            data = data.toString();
            data = data.replace(/__PORT__/, port);
            data = data.replace(/__FILENAME__/, mdFile);
            response.write(data);
            response.end();
        });
    }

    // 消息推送地址
    if (request.url === '/message') {
        fs.readFile(mdFile, (err, data) => {
            let result = md.render(data.toString());

            response.writeHead(200, {
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive'
            });
            // 数据内容用data表示，可以占用一行或多行。如果数据只有一行，则像下面这样，以"\n\n"结尾。
            // 如果数据有多行，则最后一行用"\n\n"结尾，前面行都用"\n"结尾。
            result = result.split(lineBreak).forEach((item) => {
                response.write('data: ' + item + '\n');
            });
            response.write('data: \n\n');
            response.end();
        });
    }
}).listen(port);

// 自动打开浏览器
open('http://127.0.0.1:' + port);
