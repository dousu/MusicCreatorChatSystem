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
var counter = 0;
var state = false;
var asker = "";

wss.on('connection', function (ws, req) {
    console.log('connected:', req.connection.remoteAddress, req.connection.remotePort);
    connections.push(ws);
    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
        messages = [];
        counter = 0;
        state = false;
        asker = "";
    });
    ws.on('message', function (message) {
        const sender = ws._socket._peername.address + ":" + ws._socket._peername.port;
        console.log('from:', sender);
        // console.log('from:', req.connection.remoteAddress, req.connection.remotePort);
        if (message === "") {
            console.log('request reloading');
            broadcast(JSON.stringify(messages));
        } else if (message === "_cancel") {
            console.log('cancel the previous message');
            var loc = messages.length;
            for (var i = messages.length - 1; i >= 0; i--) {
                if (messages[i][2] === sender) {
                    loc = i;
                    break;
                }
            }

            console.log('target:', messages[loc], 'number of messages:', messages.length - loc);

            messages = messages.slice(0, loc);
            if (messages.length != 0) {
                if (messages[messages.length - 1][0].includes("ask")) {
                    asker = messages[messages.length - 1][2];
                    state = true;
                    counter = (loc + 1) / 2;
                } else {
                    state = false;
                    asker = messages[messages.length - 2][2];
                    counter = loc / 2;
                }
            } else {
                state = false;
                counter = 0;
                asker = "";
            }
            broadcast(JSON.stringify(messages));
        } else if (message === "_log") {
            console.log("Logging");
            var date = new Date();
            var date_info = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
            var dir_str = "data/" + date_info.join("_");
            console.log("Write the communication log at", "\"" + dir_str + "\"");
            fs.mkdirSync(dir_str);
            messages.forEach((m, i) => {
                if (i % 2 === 0) {
                    fs.writeFileSync(dir_str + '/log_ask' + ((i + 2) / 2).toString() + '.abc', m[1]);
                } else {
                    fs.writeFileSync(dir_str + '/log_res' + ((i + 1) / 2).toString() + '.abc', m[1]);
                }
            });
        } else if (message === "_load") {
            console.log('load from reference_data/');
            glob('./reference_data/*.abc', (_, files) => {
                files.sort((a, b) => {
                    return Number(a.match(/\d+/)) - Number(b.match(/\d+/));
                });
                console.log(files);
                broadcast("_ref" + JSON.stringify(files.map((file) => {
                    var ask_f = false;
                    if (file.search("ask") > 0) {
                        ask_f = true;
                    }
                    var i = file.slice(file.search(/ask|res/) + 3, file.search(".abc"));
                    if (ask_f) {
                        return ["ask" + (i).toString(), fs.readFileSync(file, 'utf-8')];
                    } else {
                        return ["response" + (i).toString(), fs.readFileSync(file, 'utf-8')];
                    }
                })));
            });
        } else if (asker != sender) {
            console.log('receive a message');
            var str = "";
            if (!state) {
                str = "ask";
                state = true;
                asker = sender;
                counter++;
            } else {
                str = "responce";
                state = false;
                asker = "";
            }
            var title = str + " " + counter.toString();
            messages.push([title, message, sender]);
            console.log('title:', title, 'message:', message);
            broadcast(JSON.stringify(messages));
        }
    });
});

function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

server.listen(3000);