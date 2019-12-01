import ospath from "ospath";

import store from "./store";

import addReadHandler from "./add-read-handler";
import addSaveHandler from "./add-save-handler";
import createWatcher from "./create-watcher";
import readFile from "./read-file";
import parseMessage from "./parse-message";
import fsCreateProfile from "./fs-create-profile";

import imageReadHandler from "./read-handlers/image";
import paletteReadHandler from "./read-handlers/palette";
import presetReadHandler from "./read-handlers/preset";

import presetSaveHandler from "./save-handlers/preset";

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
      mediaFolderName: "media"
    };

    this.addReadHandler = addReadHandler.bind(this);
    this.addSaveHandler = addSaveHandler.bind(this);
    this.createWatcher = createWatcher.bind(this);
    this.readFile = readFile.bind(this);
    this.parseMessage = parseMessage.bind(this);
    this.fsCreateProfile = fsCreateProfile.bind(this);

    this.update = options.update;

    Object.assign(this, defaults, options);

    this.addReadHandler({ readHandler: imageReadHandler });
    this.addReadHandler({ readHandler: paletteReadHandler });
    this.addReadHandler({ readHandler: presetReadHandler });
    this.addSaveHandler({ saveHandler: presetSaveHandler });
  }

  async start() {
    store.subscribe(mutation => {
      if (mutation.type.split("/")[0] !== "media") {
        return;
      }

      if (this.update) {
        this.update(mutation);
      }
    });

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

  async saveFile({ what, name, fileType, project, payload }) {
    const { saveHandlers } = store.state;

    if (!name) {
      throw new Error("Cannot save without a name");
    }

    if (!fileType) {
      throw new Error("Cannot save without a file type");
    }

    if (!project) {
      throw new Error("Cannot save without a project");
    }

    if (!saveHandlers[what]) {
      throw new Error(`No save handler for "${what}"`);
    }

    const handler = saveHandlers[what];

    if (handler.fileTypes.indexOf(fileType) < -1) {
      throw new Error(
        `The "${what}" save handler cannot save files with a type of "${fileType}"`
      );
    }

    await fs.promises.writeFile(
      path.join(
        this.mediaDirectoryPath,
        project,
        handler.folder,
        `${name}.${fileType}`
      ),
      payload
    );

    return true;
  }
}
