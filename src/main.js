// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import { ModV } from './modv';
import App from './App';
import store from '../store';
import './assets/styles/index.scss';

import attachResizeHandles from './extra/ui-resize/attach';

Vue.config.productionTip = false;

const modV = new ModV(store);
Object.defineProperty(Vue.prototype, '$modV', {
  get() {
    return modV;
  }
});

/* eslint-disable no-new */
new Vue({
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
      'Webcam'
    ];

    modules.forEach((fileName) => {
      System.import(`@/modv/sample-modules/${fileName}`).then((Module) => {
        modV.register(Module.default);
      });
    });
    attachResizeHandles(modV);
  }
});