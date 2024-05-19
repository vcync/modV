/* eslint-env worker */
import constants from "../constants";
import registerPromiseWorker from "promise-worker/register";
import store from "./store";
import loop, { ndiWorker } from "./loop";
import grabCanvasPlugin from "../plugins/grab-canvas";
import get from "lodash.get";
import { tick as frameTick } from "./frame-counter";
import { getFeatures, setFeatures } from "./audio-features";

const fs = require("fs");

let lastKick = false;

function getFilename(path) {
  return path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
}

function getTime() {
  // const hrTime = global["process"]["hrtime"]();
  //   return hrTime[0] * 1000 + hrTime[1] / 1000000;
  return global["performance"].now();
}

async function start() {
  // For Playwright
  self._get = get;

  // const featureAssignmentPlugin = require("../plugins/feature-assignment");

  let interval = store.getters["fps/interval"];

  const commitQueue = [];

  store.subscribe((mutation) => {
    const { type: mutationType, payload: mutationPayload } = mutation;

    if (mutationType === "beats/SET_BPM" || mutationType === "fps/SET_FPS") {
      store.dispatch("tweens/updateBpm", { bpm: mutationPayload.bpm });
    }

    if (
      mutationType === "beats/SET_KICK" &&
      mutationPayload.kick === lastKick
    ) {
      return;
    } else if (
      mutationType === "beats/SET_KICK" &&
      mutationPayload.kick !== lastKick
    ) {
      lastKick = mutationPayload.kick;
    }

    if (mutationType === "fps/SET_FPS") {
      interval = store.getters["fps/interval"];
    }

    if (
      mutationType === "modules/UPDATE_ACTIVE_MODULE" &&
      (mutationPayload.key !== "props" || mutationPayload.key !== "meta")
    ) {
      return;
    }

    const {
      inputs: { inputs, inputLinks },
    } = store.state;

    // Update mutation type Input Links
    const mutationTypeInputLinks = Object.values(inputLinks).filter(
      (link) => link.type === "mutation",
    );
    const inputLinksLength = mutationTypeInputLinks.length;
    for (let i = 0; i < inputLinksLength; ++i) {
      const link = mutationTypeInputLinks[i];
      const inputId = link.id;
      const bind = inputs[inputId];

      const { type, location, data } = bind;

      const { location: linkLocation, match } = link;

      if (match.type !== mutationType) {
        continue;
      }

      let payloadMatches = false;

      if (match.payload) {
        const matchPayloadKeys = Object.keys(match.payload);
        payloadMatches = matchPayloadKeys.every((key) => {
          const value = match.payload[key];
          return value === mutationPayload[key];
        });
      } else {
        payloadMatches = true;
      }

      if (!payloadMatches) {
        continue;
      }

      const value = get(store.state, linkLocation);

      if (type === "action") {
        store.dispatch(location, { ...data, data: value });
      } else if (type === "commit") {
        store.commit(location, { ...data, data: value });
      }
    }

    commitQueue.push(mutation);
  });

  function sendCommitQueue() {
    const commits = JSON.stringify(commitQueue);
    commitQueue.splice(0, commitQueue.length);

    self.postMessage({
      type: "commitQueue",
      payload: commits,
    });
  }

  store.dispatch("plugins/add", grabCanvasPlugin);

  const rendererModules = import.meta.glob("../renderers/*.js");

  for (const pathKey in rendererModules) {
    const rendererName = getFilename(pathKey);

    rendererModules[pathKey]().then((mod) => {
      const {
        render,
        setupModule,
        updateModule,
        resizeModule,
        tick,
        resize,
        createPresetData,
        loadPresetData,
        getModuleData,
        addActiveModule,
        removeActiveModule,
      } = mod.default;

      store.commit("renderers/ADD_RENDERER", {
        name: rendererName.replace(/(\.\/|\.js)/g, ""),
        render,
        resize,
        setupModule,
        updateModule,
        resizeModule,
        createPresetData,
        loadPresetData,
        getModuleData,
        addActiveModule,
        removeActiveModule,
        tick,
      });
    });
  }

  let modulesToRegister = [];
  const sampleModules = import.meta.glob("../sample-modules/*.js");

  for (const pathKey in sampleModules) {
    const mod = await sampleModules[pathKey]();
    modulesToRegister.push(mod.default);
  }

  const isfModules = import.meta.glob("../sample-modules/isf/*.fs", {
    query: "?raw",
  });
  const isfModulesVs = import.meta.glob("../sample-modules/isf/*.vs", {
    query: "?raw",
  });

  const isfModulesVsKeys = Object.keys(isfModulesVs);

  const isfModuleKeys = Object.keys(isfModules);
  for (let i = 0, len = isfModuleKeys.length; i < len; i++) {
    const key = isfModuleKeys[i];
    const fragmentShader = (await isfModules[key]()).default;
    let vertexShader = "void main() {isf_vertShaderInit();}";
    const vsIndex = isfModulesVsKeys.indexOf(key.replace(".fs", ".vs"));
    if (vsIndex > -1) {
      vertexShader = (await isfModulesVs[isfModulesVsKeys[vsIndex]]()).default;
    }

    const isfModule = {
      meta: {
        name: getFilename(isfModuleKeys[i]),
        author: "",
        version: "1.0.0",
        type: "isf",
      },
      fragmentShader,
      vertexShader,
    };
    modulesToRegister.push(isfModule);
  }

  await Promise.all(
    modulesToRegister.map((module) =>
      store.dispatch("modules/registerModule", { module }),
    ),
  );

  modulesToRegister = [];

  // store.dispatch("plugins/add", featureAssignmentPlugin);

  const webcamOutput = await store.dispatch("outputs/getAuxillaryOutput", {
    name: "webcam",
    reactToResize: false,
    width: 1920,
    height: 1080,
    group: "input",
  });
  store.dispatch("outputs/setWebcamOutput", webcamOutput.context);

  const fftOutput = await store.dispatch("outputs/getAuxillaryOutput", {
    name: "fft",
    reactToResize: false,
    width: constants.AUDIO_BUFFER_SIZE,
    height: 1,
    group: "audio",
    id: "fft",
  });

  // eslint-disable-next-line
  let raf = requestAnimationFrame(looper);
  let frames = 0;
  let prevTime = 0;

  let now;
  let then = getTime();
  let delta;

  function looper(rafDelta) {
    raf = requestAnimationFrame(looper);

    now = getTime();
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
    sendCommitQueue();
    self.postMessage({
      type: "tick",
      payload: delta,
    });

    loop(delta, getFeatures(), fftOutput);

    frameTick();
    frames += 1;

    const time = performance.now();

    if (time >= prevTime + 1000) {
      store.commit(
        "metrics/SET_FPS_MEASURE",
        (frames * 1000) / (time - prevTime),
      );

      prevTime = time;
      frames = 0;
    }
  }

  self.addEventListener("message", async (e) => {
    const message = e.data;
    const { type, identifier, payload } = message;
    if (Array.isArray(message) && message[1].__async) {
      return;
    }

    if (type === "canvas") {
      if (message.where === "output") {
        payload.width = payload.height = 300;
        const context = payload.getContext("2d");
        store.dispatch("outputs/setMainOutput", context);
      }

      return;
    }

    if (type === "meyda") {
      setFeatures(payload);

      return;
    }

    if (type === "videoFrame") {
      const context = store.state.outputs.webcam;
      const { canvas } = context;

      canvas.width = payload.width;
      canvas.height = payload.height;

      context.drawImage(payload, 0, 0);

      return;
    }

    if (type === "loadPreset") {
      const fileBuffer = await fs.promises.readFile(payload);
      const jsonString = fileBuffer.toString();
      const preset = JSON.parse(jsonString);

      console.log(preset);

      const cleanupFunctionsAfterSwap = [];

      const storeModuleKeys = Object.keys(preset);
      for (let i = 0, len = storeModuleKeys.length; i < len; i++) {
        const storeModuleKey = storeModuleKeys[i];

        try {
          console.log("Loading from preset…", storeModuleKey);
          const fn = await store.dispatch(
            `${storeModuleKey}/loadPresetData`,
            preset[storeModuleKey],
          );

          if (fn) {
            cleanupFunctionsAfterSwap.push(fn);
          }
        } catch (e) {
          console.error(e);
        }
      }

      store.commit("groups/SWAP");
      store.commit("modules/SWAP");
      store.commit("inputs/SWAP");
      store.commit("expressions/SWAP");

      cleanupFunctionsAfterSwap.forEach((fn) => fn());

      return;
    }

    if (type === "modv-destroy") {
      console.log("worker got modv-destroy, sending onto ndi worker");

      ndiWorker.addEventListener("message", () => {
        console.log("worker got destroyed, sending onto webcontents");
        self.postMessage({ type: "destroyed" });
      });
      ndiWorker.postMessage({ type: "destroy" });
      return;
    }

    store[type](identifier, payload);
  });

  registerPromiseWorker(async (message) => {
    const { type, identifier, payload, __async } = message;
    if (__async) {
      if (type === "generatePreset") {
        const preset = {};

        const storeModuleKeys = Object.keys(store.state);
        for (let i = 0, len = storeModuleKeys.length; i < len; i++) {
          const storeModuleKey = storeModuleKeys[i];

          try {
            preset[storeModuleKey] = await store.dispatch(
              `${storeModuleKey}/createPresetData`,
            );
          } catch (e) {
            // do nothing
          }
        }

        return JSON.stringify(preset);
      }

      /**
       * @todo Don't JSON parse and stringify
       */
      const value = await store[type](identifier, payload);

      if (value) {
        return JSON.parse(JSON.stringify(value));
      }

      return undefined;
    }
  });

  self.store = store;

  self.postMessage({
    type: "worker-setup-complete",
  });
}

function handleDirname(e) {
  const message = e.data;
  const { type, payload } = message;

  if (type === "__dirname") {
    self.__dirname = payload;

    self.removeEventListener("message", handleDirname);
    start();
  }
}

self.addEventListener("message", handleDirname);
