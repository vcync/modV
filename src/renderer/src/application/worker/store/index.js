import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import beats from "./modules/beats.js";
import dataTypes from "./modules/dataTypes.js";
import errors from "./modules/errors.js";
import expressions from "./modules/expressions.js";
import fonts from "./modules/fonts.js";
import fps from "./modules/fps.js";
import groups from "./modules/groups.js";
import images from "./modules/images.js";
import inputs from "./modules/inputs.js";
import media from "./modules/media.js";
import mediaStream from "./modules/mediaStream.js";
import metrics from "./modules/metrics.js";
import meyda from "./modules/meyda.js";
import midi from "./modules/midi.js";
import modules from "./modules/modules.js";
import ndi from "./modules/ndi.js";
import osc from "./modules/osc.js";
import outputs from "./modules/outputs.js";
import plugins from "./modules/plugins.js";
import projects from "./modules/projects.js";
import renderers from "./modules/renderers.js";
import size from "./modules/size.js";
import tweens from "./modules/tweens.js";
import videos from "./modules/videos.js";
import windows from "./modules/windows.js";

const vuexPlugins = [];

// createPersistedState doesn't work in the worker store, so don't run it there.
// That's okay as the worker doesn't need to know about mediaStream.
// If we want other persisted items that the worker needs to know about
// we'll need to implement something more complex to commit via postMessage.
if (self.document !== undefined) {
  const dataState = createPersistedState({
    paths: ["mediaStream"],
  });

  vuexPlugins.push(dataState);
}

export default createStore({
  modules: {
    beats,
    dataTypes,
    errors,
    expressions,
    fonts,
    fps,
    groups,
    images,
    inputs,
    media,
    mediaStream,
    metrics,
    meyda,
    midi,
    modules,
    ndi,
    osc,
    outputs,
    plugins,
    projects,
    renderers,
    size,
    tweens,
    videos,
    windows,
  },
  plugins: vuexPlugins,
  strict: false,
});
