import Vue from "vue";
import { ipcRenderer } from "electron";

import { setupMedia, enumerateDevices } from "./setup-media";
import setupBeatDetektor from "./setup-beat-detektor";
import setupMidi from "./setup-midi";

import store from "@/store";
import windowHandler from "./window-handler";
import use from "./use";

import loop from "./loop";
import { tick as frameTick } from "./frame-counter";
// @todo: Use setFeatures again, Sam removed it as it was "not needed" :( (but it is needed)
import { getFeatures } from "./audio-features";

let imageBitmap;
const imageBitmapQueue = [];
let lastKick = false;

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
  features = Vue.observable({
    energy: 0,
    rms: 0,
    zcr: 0,
    spectralCentroid: 0,
    spectralFlatness: 0,
    spectralSlope: 0,
    spectralRolloff: 0,
    spectralSpread: 0,
    spectralSkewness: 0,
    spectralKurtosis: 0,
    perceptualSpread: 0,
    perceptualSharpness: 0
  });

  _store = store;
  store = {
    state: store.state
  };

  constructor() {
    // this.$worker.addEventListener("message", e => {
    //   if (e.data.type === "tick" && this.ready) {
    //     this.tick(e.data.payload);
    //     return;
    //   }

    //   const message = e.data;
    //   const { type } = message;

    //   if (Array.isArray(message)) {
    //     return;
    //   }
    //   const payload = e.data.payload ? JSON.parse(e.data.payload) : undefined;

    //   if (this.debug) {
    //     console.log(`⚙️%c ${type}`, "color: red", payload);
    //   }

    //   store.commit(type, payload);
    // });

    // Make the default group
    this.store.dispatch("groups/createGroup", { enabled: true });

    window.addEventListener("beforeunload", () => true);
  }

  async setup(canvas = document.createElement("canvas")) {
    let interval = store.getters["fps/interval"];

    store.subscribe(mutation => {
      const { type, payload } = mutation;

      if (type === "beats/SET_BPM" || type === "fps/SET_FPS") {
        store.dispatch("tweens/updateBpm", { bpm: payload.bpm });
      }

      if (type === "beats/SET_KICK" && payload.kick === lastKick) {
        return;
      } else if (type === "beats/SET_KICK" && payload.kick !== lastKick) {
        lastKick = payload.kick;
      }

      if (type === "fps/SET_FPS") {
        interval = store.getters["fps/interval"];
      }

      if (
        type === "modules/UPDATE_ACTIVE_MODULE" &&
        (payload.key !== "props" || payload.key !== "meta")
      ) {
        return;
      }

      // IPC

      // self.postMessage({
      //   type,
      //   payload: JSON.stringify(payload)
      // });
    });

    const renderers = require.context("./renderers/", false, /\.js$/);

    const rendererKeys = renderers.keys();
    for (let i = 0, len = rendererKeys.length; i < len; i++) {
      const rendererName = rendererKeys[i];

      const { render, setupModule, tick, resize } = renderers(
        rendererName
      ).default;

      store.commit("renderers/ADD_RENDERER", {
        name: rendererName.replace(/(\.\/|\.js)/g, ""),
        render,
        resize,
        setupModule,
        tick
      });
    }

    const sampleModules = require.context("./sample-modules/", false, /\.js$/);

    const sampleModuleKeys = sampleModules.keys();
    for (let i = 0, len = sampleModuleKeys.length; i < len; i++) {
      const moduleName = sampleModuleKeys[i];

      const sampleModule = sampleModules(moduleName).default;

      // if (module.hot) {
      //   // console.log(module);
      //   const path = `./src/application/sample-modules/${moduleName.replace(
      //     "./",
      //     ""
      //   )}`;
      //   // console.log(path);
      //   module.hot.accept(
      //     `./src/application/sample-modules/${moduleName.replace("./", "")}`,
      //     function() {
      //       console.log(`Accepting the updated ${moduleName} module!`);
      //       debugger;
      //     }
      //   );
      // }

      store.dispatch("modules/registerModule", { module: sampleModule });
    }

    const isfModules = require.context("./sample-modules/isf", false, /\.fs$/);
    const isfModulesVs = require.context(
      "./sample-modules/isf",
      false,
      /\.vs$/
    );
    const isfModulesVsKeys = isfModulesVs.keys();

    const isfModuleKeys = isfModules.keys();
    for (let i = 0, len = isfModuleKeys.length; i < len; i++) {
      const fileName = isfModuleKeys[i];
      const fragmentShader = isfModules(fileName);
      let vertexShader = "void main() {isf_vertShaderInit();}";
      const vsIndex = isfModulesVsKeys.indexOf(fileName.replace(".fs", ".vs"));
      if (vsIndex > -1) {
        vertexShader = isfModulesVs(isfModulesVsKeys[vsIndex]);
      }
      const module = {
        meta: {
          name: fileName.replace(/(\.\/|\.fs)/g, ""),
          author: "",
          version: "1.0.0",
          type: "isf"
        },
        fragmentShader,
        vertexShader
      };
      store.dispatch("modules/registerModule", { module });
    }

    // eslint-disable-next-line
    let raf = requestAnimationFrame(looper);
    let frames = 0;
    let prevTime = 0;

    let now;
    let then = Date.now();
    let delta;

    function looper(rafDelta) {
      raf = requestAnimationFrame(looper);

      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        // update time stuffs

        // Just `then = now` is not enough.
        // Lets say we set fps at 10 which means
        // each frame must take 100ms
        // Now frame executes in 16ms (60fps) so
        // the loop iterates 7 times (16*7 = 112ms) until
        // delta > interval === true
        // Eventually this lowers down the FPS as
        // 112*10 = 1120ms (NOT 1000ms).
        // So we have to get rid of that extra 12ms
        // by subtracting delta (112) % interval (100).
        // Hope that makes sense.

        then = now - (delta % interval);

        frameActions(rafDelta);
      }
    }

    function frameActions(delta) {
      self.postMessage({
        type: "tick",
        payload: delta
      });

      loop(delta, getFeatures());

      frameTick();
      frames += 1;

      const time = performance.now();

      if (time >= prevTime + 1000) {
        store.commit(
          "metrics/SET_FPS_MEASURE",
          (frames * 1000) / (time - prevTime)
        );

        prevTime = time;
        frames = 0;
      }
    }

    // WE NEED THIS AS THIS IS A PAIN IN THE ASS TO REWRITE ;)

    // if (type === "loadPreset") {
    //   const fileBuffer = await fs.promises.readFile(payload);
    //   const jsonString = fileBuffer.toString();
    //   const preset = JSON.parse(jsonString);

    //   console.log(preset);

    //   const storeModuleKeys = Object.keys(preset);
    //   for (let i = 0, len = storeModuleKeys.length; i < len; i++) {
    //     const storeModuleKey = storeModuleKeys[i];

    //     try {
    //       console.log("Loading from preset…", storeModuleKey);
    //       await store.dispatch(
    //         `${storeModuleKey}/loadPresetData`,
    //         preset[storeModuleKey]
    //       );
    //     } catch (e) {
    //       console.error(e);
    //     }
    //   }

    //   store.commit("groups/SWAP", {});
    //   store.commit("modules/SWAP", {});
    //   store.commit("inputs/SWAP", {});

    //   store.commit("groups/CLEAR_SWAP", {});
    //   store.commit("modules/CLEAR_SWAP", {});
    //   store.commit("inputs/CLEAR_SWAP", {});

    //   return;
    // }

    // registerPromiseWorker(async message => {
    //   const { type, identifier, payload, __async } = message;
    //   if (__async) {
    //     if (type === "generatePreset") {
    //       const preset = {};

    //       const storeModuleKeys = Object.keys(store.state);
    //       for (let i = 0, len = storeModuleKeys.length; i < len; i++) {
    //         const storeModuleKey = storeModuleKeys[i];

    //         try {
    //           preset[storeModuleKey] = await store.dispatch(
    //             `${storeModuleKey}/createPresetData`
    //           );
    //         } catch (e) {
    //           // do nothing
    //         }
    //       }

    //       return JSON.stringify(preset);
    //     }

    //     /**
    //      * @todo Don't JSON parse and stringify
    //      */
    //     const value = await store[type](identifier, payload);

    //     if (value) {
    //       return JSON.parse(JSON.stringify(value));
    //     }

    //     return undefined;
    //   }
    // });

    self.store = store;

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
    // const offscreen = this.canvas.transferControlToOffscreen();

    // this.$worker.postMessage(
    //   {
    //     type: "canvas",
    //     where: "output",
    //     payload: offscreen
    //   },
    //   [offscreen]
    // );

    this.store.dispatch("windows/createWindow");

    ipcRenderer.on("media-manager-state", (event, message) => {
      this.store.dispatch("media/setState", message);
    });

    ipcRenderer.on("media-manager-update", (event, message) => {
      this.store.dispatch("media/addMedia", message.payload);
    });

    ipcRenderer.on("media-manager-path-changed", (event, message) => {
      this.store.dispatch("media/setMediaDirectoryPath", message.payload);
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

    ipcRenderer.on("create-output-window", () => {
      this.store.dispatch("windows/createWindow");
    });

    ipcRenderer.on("input-update", (event, { moduleId, prop, data }) => {
      this.store.dispatch("modules/updateProp", {
        moduleId,
        prop,
        data
      });
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

    for (let i = 0; i < featuresToGet.length; i += 1) {
      const feature = featuresToGet[i];
      this.features[feature] = features[feature];
    }
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
