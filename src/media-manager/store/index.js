import Vue from "vue";
import Vuex from "vuex";

import readHandlers from "./modules/read-handlers";
import media from "./modules/media";
import plugins from "./modules/plugins";

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: false,
  modules: {
    readHandlers,
    media,
    plugins
  }
});

export default store;
