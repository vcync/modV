import { log, logError } from "./log";

const ws = require("nodejs-websocket");

export default function createWsServer() {
  const server = ws.createServer(connection => {
    log("New client");

    connection.on("error", err => logError(err));
    connection.on("text", text => this.parseMessage(text, connection));
  });

  return server;
}
