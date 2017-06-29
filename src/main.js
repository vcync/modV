// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Dropdown from 'hsy-vue-dropdown';
import Shortkey from 'vue-shortkey';
import { modV } from './modv';
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
      'Wobble'
    ];

    modules.forEach((fileName) => {
      System.import(`@/modv/sample-modules/${fileName}`).then((Module) => {
        modV.register(Module.default);
      });
    });
    attachResizeHandles();
  }
});