import { log, logError } from "./log";
import store from "./store";

const fs = require("fs");
const path = require("path");

export default async function addReadHandler({ readHandler }) {
  let ok = true;

  if (typeof readHandler.init === "function") {
    try {
      ok = await readHandler.init(
        {
          binaryPath: this.binaryPath,

          join: (...args) => path.join.call(args),

          exists: file =>
            new Promise((resolve, reject) => {
              fs.access(file, fs.constants.F_OK, err => {
                if (err) {
                  resolve();
                } else {
                  reject();
                }
              });
            })
        },
        {
          log
        }
      );
    } catch (e) {
      ok = false;
      logError(e);
    }
  }

  if (ok) {
    await store.dispatch("readHandlers/addHandler", { readHandler });
    log(`Added ReadHandler for ${readHandler.folder}`);
  }
}
