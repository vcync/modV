/* eslint-env worker node */
const { default: constants } = require("../constants");

let lastKick = false;

async function start() {
  const registerPromiseWorker = require("promise-worker/register");
  const fs = require("fs");
  const store = require("./store").default;
  const loop = require("./loop").default;
  const grabCanvasPlugin = require("../plugins/grab-canvas").default;
  const get = require("lodash.get");

  const { tick: frameTick } = require("./frame-counter");
  const { getFeatures, setFeatures } = require("./audio-features");
  // const featureAssignmentPlugin = require("../plugins/feature-assignment");

  let interval = store.getters["fps/interval"];

  const commitQueue = [];

  store.subscribe(mutation => {
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
      inputs: { inputs, inputLinks }
    } = store.state;

    // Update mutation type Input Links
    const mutationTypeInputLinks = Object.values(inputLinks).filter(
      link => link.type === "mutation"
    );
    const inputLinksLength = mutationTypeInputLinks.length;
    for (let i = 0; i < inputLinksLength; ++i) {
      const link = mutationTypeInputLinks[i];
      const inputId = link.id;
      const bind = inputs[inputId];

      const { type, location, data } = bind;

      const { type: linkType, location: linkLocation, match } = link;

      if (linkType !== "mutation" || match.type !== mutationType) {
        continue;
      }

      let payloadMatches = false;

      if (match.payload) {
        const matchPayloadKeys = Object.keys(match.payload);
        payloadMatches = matchPayloadKeys.every(key => {
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
    if (commitQueue.length === 0) {
      return;
    } else {
      console.log("commitQueueLength", commitQueue.length);
    }

    const commits = JSON.stringify(commitQueue);
    commitQueue.splice(0, commitQueue.length);

    self.postMessage({
      type: "commitQueue",
      payload: commits
    });
  }

  store.dispatch("plugins/add", grabCanvasPlugin);

  const renderers = require.context("../renderers/", false, /\.js$/);

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

  const sampleModules = require.context("../sample-modules/", false, /\.js$/);

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

  const isfModules = require.context("../sample-modules/isf", false, /\.fs$/);
  const isfModulesVs = require.context("../sample-modules/isf", false, /\.vs$/);
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

  // store.dispatch("plugins/add", featureAssignmentPlugin);

  const webcamOutput = await store.dispatch("outputs/getAuxillaryOutput", {
    name: "webcam",
    reactToResize: false,
    width: 1920,
    height: 1080,
    group: "input"
  });
  store.dispatch("outputs/setWebcamOutput", webcamOutput.context);

  const fftOutput = await store.dispatch("outputs/getAuxillaryOutput", {
    name: "fft",
    reactToResize: false,
    width: constants.AUDIO_BUFFER_SIZE,
    height: 1,
    group: "audio",
    id: "fft"
  });

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
    sendCommitQueue();
    self.postMessage({
      type: "tick",
      payload: delta
    });

    loop(delta, getFeatures(), fftOutput);

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

  self.addEventListener("message", async e => {
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

      const storeModuleKeys = Object.keys(preset);
      for (let i = 0, len = storeModuleKeys.length; i < len; i++) {
        const storeModuleKey = storeModuleKeys[i];

        try {
          console.log("Loading from preset…", storeModuleKey);
          await store.dispatch(
            `${storeModuleKey}/loadPresetData`,
            preset[storeModuleKey]
          );
        } catch (e) {
          console.error(e);
        }
      }

      store.commit("groups/SWAP", {});
      store.commit("modules/SWAP", {});
      store.commit("inputs/SWAP", {});

      store.commit("groups/CLEAR_SWAP", {});
      store.commit("modules/CLEAR_SWAP", {});
      store.commit("inputs/CLEAR_SWAP", {});

      return;
    }

    store[type](identifier, payload);
  });

  registerPromiseWorker(async message => {
    const { type, identifier, payload, __async } = message;
    if (__async) {
      if (type === "generatePreset") {
        const preset = {};

        const storeModuleKeys = Object.keys(store.state);
        for (let i = 0, len = storeModuleKeys.length; i < len; i++) {
          const storeModuleKey = storeModuleKeys[i];

          try {
            preset[storeModuleKey] = await store.dispatch(
              `${storeModuleKey}/createPresetData`
            );
          } catch (e) {
            // do nothing
          }
        }

        return JSON.stringify(preset);
      }

      if (identifier === "groups/REPLACE_GROUP_MODULES") {
        console.log("message recieved");
      }

      /**
       * @todo Don't JSON parse and stringify
       */
      const value = await store[type](identifier, payload);

      if (identifier === "groups/REPLACE_GROUP_MODULES") {
        console.log("processed store shit");
        debugger;
      }

      if (value) {
        return JSON.parse(JSON.stringify(value));
      }

      return undefined;
    }
  });

  self.store = store;
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
