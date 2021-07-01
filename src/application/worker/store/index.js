import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

const requireModule = require.context("./modules/", false, /\.js$/);
const modules = {};

const moduleKeys = requireModule.keys();
for (let i = 0, len = moduleKeys.length; i < len; i++) {
  const moduleName = moduleKeys[i];

  modules[moduleName.replace(/(\.\/|\.js)/g, "")] = requireModule(
    moduleName
  ).default;
}

Vue.use(Vuex);

const plugins = [];

// createPersistedState doesn't work in the worker store, so don't run it there.
// That's okay as the worker doesn't need to know about mediaStream.
// If we want other persisted items that the worker needs to know about
// we'll need to implement something more complex to commit via postMessage.
if (self.document !== undefined) {
  const dataState = createPersistedState({
    paths: ["mediaStream"]
  });

  plugins.push(dataState);
}

export default new Vuex.Store({
  modules,
  plugins,
  strict: false
});
