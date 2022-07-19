import express from "express";
import expressWs from "express-ws";
import uuidv4 from "uuid/v4";
import path from "path";
import { ipcMain } from "electron";

const app = express();
expressWs(app);

const PORT = 6638;
const HEARTBEAT_TIMER_MS = 10 * 1000;
const wsClients = {};
// eslint-disable-next-line
const heartBeatTimer = setInterval(() => {
  const clients = Object.values(wsClients);
  for (let i = 0, len = clients.length; i < len; i++) {
    const client = clients[i];

    if (!client.isAlive) {
      delete clients[client.id];
      return client.terminate();
    }

    client.isAlive = false;
    client.ping();
  }
}, HEARTBEAT_TIMER_MS);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "remote.html"));
});

app.ws("/", function(ws) {
  const id = uuidv4();
  ws.id = id;
  wsClients[id] = ws;
  ws.isAlive = true;

  ws.on("pong", () => {
    console.log(id, "pong");
    ws.isAlive = true;
  });

  ws.on("close", client => {
    delete wsClients[client.id];
  });

  ws.on("message", function(msg) {
    ws.send(msg);
  });
});

app.listen(PORT, () => {
  console.log(`modV remote listening on port ${PORT}`);
});

function broadcast(data) {
  const clients = Object.values(wsClients);
  for (let i = 0, len = clients.length; i < len; i++) {
    const client = clients[i];

    client.send(JSON.stringify(data));
  }
}

ipcMain.on("modv-ready", () => {
  broadcast({ type: "modv-ready" });
});

ipcMain.on("modv-destroy", () => {
  broadcast({ type: "modv-destroyed" });
});

ipcMain.on("input-update", (event, payload) => {
  broadcast({ type: "input-update", payload });
});

ipcMain.on("commit", (event, payload) => {
  broadcast({ type: "commit", payload });
});
