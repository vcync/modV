//jshint esversion:6

let forIn = (object, filter) => {
	for(let key in object) {
        filter(object[key], key);
    }
};

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        // Broadcast any received message to all clients
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});

wss.broadcast = function(data) {
    forIn(this.clients, (client) => {
        client.send(data);
    });
};