// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Dropdown from 'hsy-vue-dropdown';
import Shortkey from 'vue-shortkey';
import VueThrottleEvent from 'vue-throttle-event';
import Buefy from 'buefy';
import Vuebar from 'vuebar';

import Capitalize from '@/vuePlugins/capitalize-filter';

import stats from '@/extra/stats';
import { ModuleISF, modV } from './modv';
import App from './App';
import store from '../store';
import contextMenu from './extra/context-menu';
import expression from './extra/expression';
import midiAssignment from './extra/midi-assignment';
import featureAssignment from './extra/feature-assignment';
import lfo from './extra/lfo';
import frameGrab from './extra/frame-grab';
import grabCanvas from './extra/grab-canvas';
import './assets/styles/index.scss';

import attachResizeHandles from './extra/ui-resize/attach';

Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$modV', {
  get() {
    return modV;
  },
});

document.body.appendChild(stats.dom);
stats.dom.style.left = null;
stats.dom.style.right = 0;
stats.dom.classList.add('hidden');

Vue.use(Capitalize);

Vue.use(Vuebar);
Vue.use(Buefy, {
  defaultIconPack: 'fa',
});
Vue.use(VueThrottleEvent);
Vue.use(Dropdown);
Vue.use(Shortkey);
Vue.use(contextMenu);
Vue.use(featureAssignment);
Vue.use(expression);
Vue.use(midiAssignment);
Vue.use(lfo);
Vue.use(grabCanvas);

modV.use(contextMenu);
modV.use(featureAssignment);
modV.use(expression);
modV.use(midiAssignment);
modV.use(lfo);
modV.use(frameGrab);
modV.use(grabCanvas);

/* eslint-disable no-new */
export default window.modVVue = new Vue({
  el: '#app',
  template: '<App/>',
  components: { App },
  store,
  data: {
    modV,
  },
  mounted() {
    modV.start(this);

    const modules = [
      'Waveform',
      'Ball',
      'Text',
      'Webcam',
      'Pixelate',
      'Plasma',
      'MattiasCRT',
      'ChromaticAbberation',
      'Wobble',
      'OpticalFlowDistort',
      'Neon',
      'Fisheye',
      'MirrorEdge',
      'EdgeDistort',
      'Polygon',
      'Concentrics',
      'Phyllotaxis',
    ];

    modules.forEach((fileName) => {
      import(`@/modv/sample-modules/${fileName}`).then((Module) => {
        modV.register(Module.default);
      });
    });

    const isfSamples = [
      'film-grain.fs',
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
      'Zebre.fs',
      'st_lsfGDH.fs',
      'st_Ms2SD1.fs.fs',
      'rotozoomer.fs',
      'Kaleidoscope.fs',
      'RGB Halftone-lookaround.fs',
      'Circuits.fs',
      'BrightnessContrast.fs',
      'UltimateSpiral.fs',
      'MBOX3.fs',
      'HexVortex.fs',
      'Hue-Saturation.fs',
      'Vignette.fs',
      'v002 Crosshatch.fs',
      'Sine Warp Tile.fs',
      'RGB Trails 3.0.fs',
      'RGB Strobe.fs',
      'Kaleidoscope Tile.fs',
      'Interlace.fs',
      'Convergence.fs',
      'Collage.fs',
      'Pinch.fs',
      'Slice.fs',
      'digital-crystal-tunnel.fs',
      'film-grain.fs',
      'spherical-shader-tut.fs',
      'scale.fs',
      'LogTransWarpSpiral.fs',
    ];

    isfSamples.forEach((fileName) => {
      import(`@/modv/sample-modules/isf-samples/${fileName}`).then((fragmentShader) => {
        class Module extends ModuleISF {
          constructor() {
            super({
              info: {
                name: fileName,
                author: '2xAA',
                version: 0.1,
                meyda: [],
              },
              fragmentShader,
            });
          }
        }

        modV.register(Module);
      }).catch((e) => {
        throw new Error(e);
      });
    });

    attachResizeHandles();
  },
});
