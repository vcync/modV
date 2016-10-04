//jshint node:true
'use strict';

const ws = require('nodejs-websocket');
const port = 3133;
let clients = [];

var server = ws.createServer(client => {
    var clientIndex = clients.push(client)-1;
    client.clientIndex = clientIndex;

    console.log('New remote client', clientIndex);


    client.send(JSON.stringify({
        type: 'hello'
    }));

    client.on('close', () => {
        console.log('Lost remote client', client.clientIndex);
        clients.splice(client.clientIndex, 1);
    });

    client.on('text', data => {

        console.log('From', client.clientIndex);
        console.log(JSON.stringify(JSON.parse(data), null, 4));

        clients.forEach(client => {
            try {
                client.send(data);
            } catch(e) {
                console.error(e);
            }
        });
    });
});

server.listen(port, () => {
    console.log('remote server listening on port', port);
});