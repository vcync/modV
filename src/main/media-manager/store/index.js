import Vue from "vue";
import Vuex from "vuex";

import readHandlers from "./modules/read-handlers";
import saveHandlers from "./modules/save-handlers";
import media from "./modules/media";
import plugins from "./modules/plugins";

Vue.use(Vuex);

const modules = {
  readHandlers,
  saveHandlers,
  media,
  plugins
};

const store = new Vuex.Store({
  strict: false,
  modules,

  actions: {
    resetAll({ commit }) {
      const moduleKeys = Object.keys(modules);
      for (let i = 0, len = moduleKeys.length; i < len; i++) {
        const moduleKey = moduleKeys[i];

        commit(`${moduleKey}/RESET_STATE`);
      }
    }
  }
});

export default store;
