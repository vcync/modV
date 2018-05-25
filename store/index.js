import Vue from 'vue';
import Vuex from 'vuex';
import createPersist from 'vuex-localstorage';
import controlPanels from './modules/control-panels';
import layers from './modules/layers';
import mediaStream from './modules/media-stream';
import meyda from './modules/meyda';
import modVModules from './modules/modv-modules';
import palettes from './modules/palettes';
import plugins from './modules/plugins';
import profiles from './modules/profiles';
import size from './modules/size';
import tempo from './modules/tempo';
import user from './modules/user';
import windows from './modules/windows';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
if (debug) {
  console.warn(`modV: Vuex is in STRICT mode as NODE_ENV is set to "${process.env.NODE_ENV}".\n
All commits are syncronously watched. Performance lag is due to this.`);
}

export default new Vuex.Store({
  plugins: [
    createPersist({
      namespace: 'modv',
      initialState: {},
      paths: ['user'],
      expires: 0, // Never expire
    }),
  ],
  modules: {
    controlPanels,
    layers,
    mediaStream,
    meyda,
    modVModules,
    palettes,
    plugins,
    profiles,
    size,
    tempo,
    user,
    windows,
  },
  strict: debug,
});
