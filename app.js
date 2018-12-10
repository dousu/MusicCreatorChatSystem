const http = require('http');
const express = require('express');
const app = express();
const WebSocketServer = require('ws').Server;

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
        console.log(ws._socket._peername.address + ":" + ws._socket._peername.port);
        // console.log('from:', req.connection.remoteAddress, req.connection.remotePort);
        if (asker != ws._socket._peername.address + ":" + ws._socket._peername.port) {
            var str = "";
            if (!state) {
                str = "ask";
                state = true;
                asker = ws._socket._peername.address + ":" + ws._socket._peername.port;
                counter++;
            } else {
                str = "responce";
                state = false;
            }
            var title = str + " " + counter.toString();
            messages.push([title, message]);
            console.log('message:', JSON.stringify([title, message]));
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