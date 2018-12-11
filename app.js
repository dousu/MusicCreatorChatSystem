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
        const sender = ws._socket._peername.address + ":" + ws._socket._peername.port;
        console.log(sender);
        // console.log('from:', req.connection.remoteAddress, req.connection.remotePort);
        if (message == "") {
            broadcast(JSON.stringify(messages));
        } else if (message == "_cancel") {
            //look for the last message from sender
            var loc = messages.length;
            for (var i = messages.length - 1; i >= 0; i--) {
                if (messages[i][2] === sender) {
                    loc = i;
                    break;
                }
            }
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
        } else if (asker != sender) {
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
            console.log('message:', JSON.stringify([title, message, sender]));
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