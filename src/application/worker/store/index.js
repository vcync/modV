import Vue from "vue";
import Vuex from "vuex";
import media from "../../../media-manager/store/modules/media";

const requireModule = require.context("./modules/", false, /\.js$/);
const modules = { media };

const moduleKeys = requireModule.keys();
for (let i = 0, len = moduleKeys.length; i < len; i++) {
  const moduleName = moduleKeys[i];

  modules[moduleName.replace(/(\.\/|\.js)/g, "")] = requireModule(
    moduleName
  ).default;
}

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
  strict: false
});
