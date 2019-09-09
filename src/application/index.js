import Worker from "worker-loader!./worker";
import setupMedia from "./setup-media";
import setupBeatDetektor from "./setup-beat-detektor";
import store from "./worker/store";
import windowHandler from "./window-handler";
import use from "./use";

const PromiseWorker = require("promise-worker-transferable");

export default class ModV {
  _mediaStream;
  _imageCapture;
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
    try {
      this._mediaStream = await this.setupMedia();
    } catch (e) {
      console.error(e);
    }

    const [track] = this._mediaStream.getVideoTracks();
    if (track) {
      this._imageCapture = new ImageCapture(track);
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

    this.raf = requestAnimationFrame(this.loop.bind(this));
  }

  async loop(delta) {
    const { meyda: featuresToGet } = this.store.state;

    const features = this.meyda.get(featuresToGet);
    this.updateBeatDetektor(delta, features);
    this.$worker.postMessage({ type: "meyda", payload: features });

    if (
      // Don't try to take a frame while the window is unfocused, Chrome kills the feed irreparably
      !document.hidden &&
      this._imageCapture &&
      this._imageCapture.track.readyState === "live" &&
      !this._imageCapture.track.muted
    ) {
      let imageBitmap;
      try {
        imageBitmap = await this._imageCapture.grabFrame();
      } catch (e) {
        console.error(e, e.message, this._imageCapture.track.readyState);
      }

      if (imageBitmap) {
        this.$worker.postMessage({ type: "videoFrame", payload: imageBitmap }, [
          imageBitmap
        ]);
      }
    }

    this.raf = requestAnimationFrame(this.loop.bind(this));
  }

  setSize({ width, height }) {
    this.store.dispatch("size/setSize", { width, height });
  }
}
