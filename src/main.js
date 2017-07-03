// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Dropdown from 'hsy-vue-dropdown';
import Shortkey from 'vue-shortkey';
import { ModuleISF, modV } from './modv';
import App from './App';
import store from '../store';
import './assets/styles/index.scss';

import attachResizeHandles from './extra/ui-resize/attach';

Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$modV', {
  get() {
    return modV;
  }
});

Vue.use(Dropdown);
Vue.use(Shortkey);

/* eslint-disable no-new */
window.modVVue = new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  store,
  data: {
    modV
  },
  mounted() {
    modV.start();

    const modules = [
      'Waveform',
      'Ball',
      'Webcam',
      'Plasma',
      'MattiasCRT',
      'FilmGrain',
      'ChromaticAbberation',
      'Stretch',
      'Wobble',
      'OpticalFlowDistort',
      'Neon'
    ];

    modules.forEach((fileName) => {
      System.import(`@/modv/sample-modules/${fileName}`).then((Module) => {
        modV.register(Module.default);
      });
    });

    const isfSamples = [
      'plasma.fs',
      'Random Shape.fs',
      'Triangles.fs',
      'Echo Trace.fs',
      'rgbtimeglitch.fs',
      'badtv.fs',
      'edges.fs',
      'feedback.fs',
      'rgbglitchmod.fs',
      'tapestryfract.fs'
    ];

    isfSamples.forEach((fileName) => {
      System.import(`@/modv/sample-modules/isf-samples/${fileName}`).then((fragmentShader) => {
        class Module extends ModuleISF {
          constructor() {
            super({
              info: {
                name: fileName,
                author: '2xAA',
                version: 0.1,
                meyda: []
              },
              fragmentShader
            });
          }
        }

        modV.register(Module);
      });
    });

    attachResizeHandles();
  }
});