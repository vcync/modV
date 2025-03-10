import { createStore } from "vuex";

import readHandlers from "./modules/read-handlers";
import saveHandlers from "./modules/save-handlers";
import media from "./modules/media";
import plugins from "./modules/plugins";

const modules = {
  readHandlers,
  saveHandlers,
  media,
  plugins,
};

const store = createStore({
  strict: false,
  modules,

  actions: {
    resetAll({ commit }) {
      const moduleKeys = Object.keys(modules);
      for (let i = 0, len = moduleKeys.length; i < len; i++) {
        const moduleKey = moduleKeys[i];

        commit(`${moduleKey}/RESET_STATE`);
      }
    },
  },
});

export default store;
