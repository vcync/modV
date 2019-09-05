import Worker from "worker-loader!./worker";
import setupMedia from "./setup-media";
import setupBeatDetektor from "./setup-beat-detektor";
import store from "./worker/store";
import windowHandler from "./window-handler";
import use from "./use";

const PromiseWorker = require("promise-worker-transferable");

export default class ModV {
  setupMedia = setupMedia;
  setupBeatDetektor = setupBeatDetektor;
  windowHandler = windowHandler;
  use = use;

  _store = store;
  store = {
    state: store.state
  };

  constructor() {
    this.$worker = new Worker();
    this.$asyncWorker = new PromiseWorker(this.$worker);

    this.$worker.addEventListener("message", e => {
      const message = e.data;
      const { type } = message;

      if (Array.isArray(message)) {
        return;
      }
      const payload = JSON.parse(e.data.payload);

      if (
        type !== "metrics/SET_FPS_MEASURE" &&
        type !== "beats/SET_BPM" &&
        type !== "beats/SET_KICK"
      ) {
        console.log(`⚙️%c ${type}`, "color: red", payload);
      }

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
  }

  async setup(canvas) {
    this.windowHandler();
    await this.setupMedia();
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

    this.raf = requestAnimationFrame(this.loop.bind(this));
  }

  loop(delta) {
    this.raf = requestAnimationFrame(this.loop.bind(this));
    const { meyda: featuresToGet } = this.store.state;

    const features = this.meyda.get(featuresToGet);
    this.updateBeatDetektor(delta, features);
    this.$worker.postMessage({ type: "meyda", payload: features });
  }

  setSize({ width, height }) {
    this.store.dispatch("size/setSize", { width, height });
  }
}
