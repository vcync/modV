import Vue from "vue";
import Vuex from "vuex";

import readHandlers from "./modules/read-handlers";
import saveHandlers from "./modules/save-handlers";
import media from "./modules/media";
import plugins from "./modules/plugins";

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: false,
  modules: {
    readHandlers,
    saveHandlers,
    media,
    plugins
  }
});

export default store;
