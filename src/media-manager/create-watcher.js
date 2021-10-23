import store from "./store";
import { log } from "./log";

const chokidar = require("chokidar");
const os = require("os");

export default function createWatcher() {
  return new Promise(resolve => {
    if (this.watcher) {
      this.watcher.close();
    }

    const ignored = [
      os.platform() === "darwin" ? /(^|[/\\])\../ : undefined,
      /node_modules/,
      "**/package.json",
      "**/package-lock.json",
      /isf\/temp/
    ].concat(store.getters["readHandlers/ignored"]);

    this.watcher = chokidar.watch(this.mediaDirectoryPath, {
      ignored
    });

    this.watcher
      .on("add", filePath => {
        log(`➕  File ${filePath} has been added`);
        this.readFile(filePath);
      })
      .on("change", filePath => {
        log(`🔄  File ${filePath} has been changed`);
        this.readFile(filePath);
      })
      .on("unlink", filePath => {
        log(`➖  File ${filePath} has been removed`);
        this.removeFile(filePath);
      })
      // .on('addDir', (changedPath) => {
      //   log(`➕  Directory ${changedPath} has been added`);
      //   const seperated = changedPath.split(path.sep);

      //   if (seperated[seperated.length - 2] === this.mediaFolderName) {
      //     this.addProfile(seperated[seperated.length - 1]);
      //   }
      // })
      // .on('unlinkDir', (changedPath) => {
      //   log(`➖  Directory ${changedPath} has been removed`);

      //   const seperated = changedPath.split(path.sep);

      //   if (seperated[seperated.length - 2] === this.mediaFolderName) {
      //     this.removeProfile(seperated[seperated.length - 1]);
      //   }
      // })
      .on("ready", () => {
        resolve();
      });
  });
}
