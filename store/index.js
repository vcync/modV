import Vue from 'vue';
import Vuex from 'vuex';
import layers from './modules/layers';
import mediaStream from './modules/media-stream';
import meyda from './modules/meyda';
import modVModules from './modules/modv-modules';
import palettes from './modules/palettes';
import size from './modules/size';
import tempo from './modules/tempo';
import user from './modules/user';
import windows from './modules/windows';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    layers,
    mediaStream,
    meyda,
    modVModules,
    palettes,
    size,
    tempo,
    user,
    windows
  },
  strict: debug
});