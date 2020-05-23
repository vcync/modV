/* eslint-env worker node */

let lastKick = false;

async function start() {
  const registerPromiseWorker = require("promise-worker/register");
  const fs = require("fs");
  const store = require("./store").default;
  const loop = require("./loop").default;
  const { tick: frameTick } = require("./frame-counter");
  const { getFeatures, setFeatures } = require("./audio-features");
  // const featureAssignmentPlugin = require("../plugins/feature-assignment");

  store.subscribe(mutation => {
    const { type, payload } = mutation;

    if (type === "beats/SET_BPM") {
      store.dispatch("tweens/updateBpm", { bpm: payload.bpm });
    }

    if (type === "beats/SET_KICK" && payload.kick === lastKick) {
      return;
    } else if (type === "beats/SET_KICK" && payload.kick !== lastKick) {
      lastKick = payload.kick;
    }

    if (
      type === "modules/UPDATE_ACTIVE_MODULE" &&
      (payload.key !== "props" || payload.key !== "meta")
    ) {
      return;
    }

    self.postMessage({
      type,
      payload: JSON.stringify(payload)
    });
  });

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

    store.dispatch("modules/registerModule", sampleModule);
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
    store.dispatch("modules/registerModule", module);
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

  // eslint-disable-next-line
  let raf = requestAnimationFrame(looper);
  let frames = 0;
  let prevTime = 0;

  function looper(delta) {
    raf = requestAnimationFrame(looper);
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
