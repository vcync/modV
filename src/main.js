// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Dropdown from 'hsy-vue-dropdown';
import Shortkey from 'vue-shortkey';
import vmodal from 'vue-js-modal';
import stats from '@/extra/stats';
import { ModuleISF, modV } from './modv';
import App from './App';
import store from '../store';
import contextMenu from './extra/context-menu';
import expression from './extra/expression';
import midiAssignment from './extra/midi-assignment';
import featureAssignment from './extra/feature-assignment';
import './assets/styles/index.scss';

import attachResizeHandles from './extra/ui-resize/attach';

Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$modV', {
  get() {
    return modV;
  }
});

document.body.appendChild(stats.dom);
stats.dom.style.left = null;
stats.dom.style.right = 0;
stats.dom.classList.add('hidden');

Vue.use(Dropdown);
Vue.use(Shortkey);
Vue.use(contextMenu, {
  store
});
Vue.use(featureAssignment, {
  store
});
Vue.use(expression, {
  store
});
Vue.use(midiAssignment, {
  store
});
Vue.use(vmodal);

modV.use(featureAssignment);
modV.use(expression);
modV.use(midiAssignment);

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
      'Neon'/* ,
      'SolidColor'*/
    ];

    modules.forEach((fileName) => {
      System.import(`@/modv/sample-modules/${fileName}`).then((Module) => {
        modV.register(Module.default);
      });
    });

    const isfSamples = [
      'block-color.fs',
      'plasma.fs',
      'Random Shape.fs',
      'Triangles.fs',
      'Echo Trace.fs',
      'rgbtimeglitch.fs',
      'badtv.fs',
      'feedback.fs',
      'rgbglitchmod.fs',
      'tapestryfract.fs',
      'hexagons.fs',
      'UltimateFlame.fs',
      'CompoundWaveStudy1.fs',
      'FractilianParabolicCircleInversion.fs',
      'ASCII Art.fs',
      'CollapsingArchitecture.fs',
      'Dither-Bayer.fs',
      'GreatBallOfFire.fs',
      'VHS Glitch.fs.fs',
      'Zebre.fs'
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
      }).catch((e) => {
        console.log(e);
      });
    });

    attachResizeHandles();
  }
});

export default window.modVVue;