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
import moduleReadHandler from "./read-handlers/module";
import isfReadHandler from "./read-handlers/isf";
import videoReadHandler from "./read-handlers/video";

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
    this.$store = store;

    this.update = () => {
      if (options.update) {
        options.update(...arguments);
      }
    };

    this.pathChanged = () => {
      if (options.pathChanged) {
        options.pathChanged(...arguments);
      }
    };

    Object.assign(this, defaults, options);

    this.addReadHandler({ readHandler: imageReadHandler });
    this.addReadHandler({ readHandler: paletteReadHandler });
    this.addReadHandler({ readHandler: presetReadHandler });
    this.addReadHandler({ readHandler: moduleReadHandler });
    this.addReadHandler({ readHandler: isfReadHandler });
    this.addReadHandler({ readHandler: videoReadHandler });

    this.addSaveHandler({ saveHandler: presetSaveHandler });

    store.subscribe(mutation => {
      if (mutation.type.split("/")[0] !== "media") {
        return;
      } else if (mutation.type === "media/SET_MEDIA_DIRECTORY_PATH") {
        this.pathChanged(mutation);
        return;
      }

      this.update(mutation);
    });

    (async () => {
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
    })();
  }

  async start() {
    await store.dispatch("media/setMediaDirectoryPath", {
      path: this.mediaDirectoryPath
    });
    await this.createWatcher();
  }

  async reset() {
    await store.dispatch("resetAll");
    await store.dispatch("media/setMediaDirectoryPath", {
      path: this.mediaDirectoryPath
    });
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
