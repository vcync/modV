import ospath from "ospath";

import store from "./store";
import { log } from "./log";

import addReadHandler from "./add-read-handler";
import createWsServer from "./create-ws-server";
import createHttpServer from "./create-http-server";
import createWatcher from "./create-watcher";
import readFile from "./read-file";
import parseMessage from "./parse-message";
import fsCreateProfile from "./fs-create-profile";

import imageHandler from "./read-handlers/image";
import paletteHandler from "./read-handlers/palette";
import presetHandler from "./read-handlers/preset";

import path from "path";
import fs from "fs";

import { promisify } from "util";
import mkdirpTop from "mkdirp";

const mkdirp = promisify(mkdirpTop);

export default class MediaManager {
  get dataPath() {
    return path.join(ospath.data(), "modV");
  }

  get mediaDirectoryPath() {
    return path.join(this.dataPath, "media");
  }

  constructor(options) {
    const defaults = {
      wsPort: 3132,
      httpPort: 3133,
      mediaFolderName: "media"
    };

    this.addReadHandler = addReadHandler.bind(this);
    this.createWatcher = createWatcher.bind(this);
    this.createWsServer = createWsServer.bind(this);
    this.createHttpServer = createHttpServer.bind(this);
    this.readFile = readFile.bind(this);
    this.parseMessage = parseMessage.bind(this);
    this.fsCreateProfile = fsCreateProfile.bind(this);

    this.update = options.update;

    Object.assign(this, defaults, options);

    this.addReadHandler({ readHandler: imageHandler });
    this.addReadHandler({ readHandler: paletteHandler });
    this.addReadHandler({ readHandler: presetHandler });
  }

  async start() {
    store.subscribe(mutation => {
      if (mutation.type.split("/")[0] !== "media") {
        return;
      }

      if (this.update) {
        this.update(mutation);
      }
      // this.broadcast(JSON.stringify(mutation));
    });

    await this.createServers();
    await this.createWatcher();

    try {
      await fs.promises.access(path.join(this.mediaDirectoryPath));
    } catch (error) {
      await mkdirp(this.mediaDirectoryPath);
    }

    try {
      await fs.promises.access(path.join(this.mediaDirectoryPath, "default"));
    } catch (error) {
      this.fsCreateProfile("default");
    }
  }

  createServers() {
    return new Promise(resolve => {
      this.wsServer = this.createWsServer();
      this.wsServer.listen(this.wsPort, () => {
        log(`WebSocket server running on port ${this.wsPort}`);

        const httpServer = this.createHttpServer();
        this.httpServer = httpServer.listen(this.httpPort, () => {
          log(`HTTP server running on port ${this.httpPort}`);

          resolve();
        });
      });
    });
  }

  broadcast(data) {
    if (!this.wsServer) {
      return;
    }

    const connections = this.wsServer.connections;
    for (let i = 0, len = connections.length; i < len; i++) {
      connections[i].send(data);
    }
  }
}
