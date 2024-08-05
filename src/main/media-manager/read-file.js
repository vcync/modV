import { log } from "./log";
import store from "./store";

const fs = require("fs");
const path = require("path");

export default async function readFile(filePath) {
  const relativePath = filePath.replace(this.mediaDirectoryPath, "");
  const parsed = path.parse(relativePath);

  const seperated = relativePath.split(path.sep);
  const project = seperated[seperated.length - 3];
  const folder = seperated[seperated.length - 2];

  const fileType = parsed.ext.replace(".", "").toLowerCase();
  const fileName = parsed.name;

  const handlers = store.getters["readHandlers/forFileType"](folder, fileType);
  if (!handlers || !handlers.length) {
    return;
  }

  for (let i = 0, len = handlers.length; i < len; i++) {
    const handler = handlers[i];

    const file = fs.createReadStream(filePath, { encoding: "utf8" });

    const processResult = await handler.process(
      {
        file,
        fileName,
        fileType,
        filePath
      },
      {
        getStream: () => {},
        log
      }
    );

    if (processResult && typeof processResult === "boolean") {
      store.dispatch("media/addMedia", {
        project,
        folder,
        item: {
          name: fileName,
          path: relativePath
        }
      });
    } else if (processResult && typeof processResult === "object") {
      const { filePath: path } = processResult;
      const relativePath = path.replace(this.mediaDirectoryPath, "");

      store.dispatch("media/addMedia", {
        project,
        folder,
        item: {
          name: fileName,
          path: relativePath
        }
      });
    }
  }
}
