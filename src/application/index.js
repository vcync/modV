import Worker from "worker-loader!./worker/index.worker.js";
import { setupMedia, enumerateDevices } from "./setup-media";
import setupBeatDetektor from "./setup-beat-detektor";
import setupMidi from "./setup-midi";

import store from "./worker/store";
import windowHandler from "./window-handler";
import use from "./use";

import PromiseWorker from "promise-worker-transferable";

import { ipcRenderer, remote } from "electron";

let imageBitmap;
const imageBitmapQueue = [];

export default class ModV {
  _mediaStream;
  _imageCapture;
  setupMedia = setupMedia;
  enumerateDevices = enumerateDevices;
  setupBeatDetektor = setupBeatDetektor;
  setupMidi = setupMidi;
  windowHandler = windowHandler;
  use = use;
  debug = false;
  ready = false;

  _store = store;
  store = {
    state: store.state
  };

  constructor() {
    this.$worker = new Worker();
    this.$asyncWorker = new PromiseWorker(this.$worker);

    this.$worker.postMessage({
      type: "__dirname",
      payload: remote.app.getAppPath()
    });

    this.$worker.addEventListener("message", e => {
      if (e.data.type === "tick" && this.ready) {
        this.tick(e.data.payload);
        return;
      }

      const message = e.data;
      const { type } = message;

      if (Array.isArray(message)) {
        return;
      }
      const payload = e.data.payload ? JSON.parse(e.data.payload) : undefined;

      // if (
      //   type !== "metrics/SET_FPS_MEASURE" &&
      //   type !== "modules/UPDATE_ACTIVE_MODULE_PROP" &&
      //   type !== "beats/SET_BPM" &&
      //   type !== "beats/SET_KICK"
      // ) {
      if (this.debug) {
        console.log(`⚙️%c ${type}`, "color: red", payload);
      }
      // }

      store.commit(type, payload);
    });

    const that = this;

    this.store = {
      state: store.state,
      getters: store.getters,

      async commit(...args) {
        return await that.$asyncWorker.postMessage(
          {
            __async: true,
            type: "commit",
            identifier: args[0],
            payload: args[1]
          },
          args[2]
        );
      },

      async dispatch(...args) {
        return await that.$asyncWorker.postMessage(
          {
            __async: true,
            type: "dispatch",
            identifier: args[0],
            payload: args[1]
          },
          args[2]
        );
      }
    };

    // Make the default group
    this.store.dispatch("groups/createGroup", { enabled: true });

    window.addEventListener("beforeunload", () => true);
  }

  async setup(canvas = document.createElement("canvas")) {
    this.windowHandler();

    try {
      await this.setupMedia({});
    } catch (e) {
      console.error(e);
    }

    // listen to mediastream device changes
    navigator.mediaDevices.ondevicechange = () => {
      this.enumerateDevices();
    };

    try {
      await this.setupMidi();
    } catch (e) {
      console.error(e);
    }

    this.setupBeatDetektor();

    this.canvas = canvas;
    const offscreen = this.canvas.transferControlToOffscreen();

    this.$worker.postMessage(
      {
        type: "canvas",
        where: "output",
        payload: offscreen
      },
      [offscreen]
    );

    this.store.dispatch("windows/createWindow");

    ipcRenderer.on("media-manager-state", (event, message) => {
      this.store.dispatch("media/setState", message);
    });

    ipcRenderer.on("media-manager-update", (event, message) => {
      this.store.dispatch("media/addMedia", message.payload);
    });

    ipcRenderer.on("open-preset", (event, message) => {
      this.loadPreset(message);
    });

    ipcRenderer.on("generate-preset", async () => {
      ipcRenderer.send("preset-data", await this.generatePreset());
    });

    ipcRenderer.on("set-current-project", async (event, message) => {
      await this.store.dispatch("projects/setCurrentProject", message);
      ipcRenderer.send(
        "current-project",
        this.store.state.projects.currentProject
      );
    });

    this.ready = true;
    ipcRenderer.send("modv-ready");
    ipcRenderer.send("get-media-manager-state");

    window.addEventListener("beforeunload", () => {
      ipcRenderer.send("modv-destroy");
    });
  }

  async inputLoop() {
    if (
      this._imageCapture &&
      this._imageCapture.track.readyState === "live" &&
      !this._imageCapture.track.muted
    ) {
      try {
        imageBitmap = await this._imageCapture.grabFrame();
      } catch (e) {
        if (e) {
          console.error(e, e.message, this._imageCapture.track.readyState);
        }
      }

      if (
        imageBitmap &&
        imageBitmap.width &&
        imageBitmap.height &&
        !imageBitmapQueue.length
      ) {
        imageBitmapQueue.push(imageBitmap);
      }

      while (imageBitmapQueue.length) {
        const bitmap = imageBitmapQueue.splice(0, 1)[0];

        this.$worker.postMessage({ type: "videoFrame", payload: bitmap }, [
          bitmap
        ]);
      }
    }
  }

  loop(delta) {
    const {
      meyda: { features: featuresToGet }
    } = this.store.state;

    const features = this.meyda.get(featuresToGet);
    this.updateBeatDetektor(delta, features);
    this.$worker.postMessage({ type: "meyda", payload: features });
  }

  setSize({ width, height }) {
    this.store.dispatch("size/setSize", { width, height });
  }

  tick(delta) {
    this.loop(delta);
    this.inputLoop(delta);
  }

  async generatePreset() {
    return await this.$asyncWorker.postMessage({
      __async: true,
      type: "generatePreset"
    });
  }

  loadPreset(filePathToPreset) {
    this.$worker.postMessage({ type: "loadPreset", payload: filePathToPreset });
  }
}
