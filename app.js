const http = require('http');
const express = require('express');
const app = express();
const WebSocketServer = require('ws').Server;
const fs = require('fs');
const glob = require('glob');

app.use('/dist', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/dist'));
var server = http.createServer(app);
var wss = new WebSocketServer({ server: server });

var connections = [];
var messages = [];
var gen = 1;

var date = new Date();
var date_info = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
var dir_str = "data/" + date_info.join("_");
if (!fs.existsSync(dir_str)) {
    fs.mkdirSync(dir_str);
}
load_files('./reference_data/');

wss.on('connection', function (ws, req) {
    console.log('connected:', req.connection.remoteAddress, req.connection.remotePort);
    connections.push(ws);
    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });
    console.log('Messages', messages);
    if (messages.length > 0)
        ws.send("_ref" + JSON.stringify(new Array(messages[messages.length - 1])));
    ws.on('message', function (message) {
        gen = messages.length + 1;
        const sender = ws._socket._peername.address + ":" + ws._socket._peername.port;
        console.log('from:', sender);
        console.log('receive a message');
        var title = 'music ' + gen.toString();
        messages.push([title, message, sender]);
        var dir_str_gen = dir_str + '/generation' + gen.toString();
        if (!fs.existsSync(dir_str_gen)) {
            fs.mkdirSync(dir_str_gen);
        }
        fs.writeFileSync(dir_str_gen + '/s' + sender.replace(/:/g, '_') + '.abc', message);
        console.log('title:', title, 'message:', message);
        gen = gen + 1;
    });
});

function load_files(path_name) {
    messages = [];
    console.log('load from ' + path_name);
    glob(path_name + 'generation*', (_, dirs) => {
        dirs.sort((a, b) => {
            return Number(a.match(/\d+/)) - Number(b.match(/\d+/));
        });
        console.log('directories', dirs);
        dirs.forEach((dir) => {
            var tmp_msg = [];
            glob(dir + '/*.abc', (xx, files) => {
                console.log('files', files);
                tmp_msg = files.map((file) => {
                    return ['music ' + dir.slice(path_name.length + 'generation'.length, file.length), fs.readFileSync(file, 'utf-8'), file.slice('s'.length, file.length - '.abc'.length).replace(/_/g, ':')];
                });
                messages = messages.concat(tmp_msg);
            });
        });
    });
}
server.listen(3000);