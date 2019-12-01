import { log } from "./log";
import store from "./store";

const fs = require("fs");
const path = require("path");

export default async function readFile(filePath) {
  const relativePath = filePath.replace(this.mediaDirectoryPath, "");
  const parsed = path.parse(relativePath);

  const seperated = relativePath.split(path.sep);
  const project = seperated[1];
  const folder = seperated[2];

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
        fileType
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
          path: filePath
        }
      });
    } else if (processResult && typeof processResult === "object") {
      console.log("add this file in a different way");
    }
  }
}
