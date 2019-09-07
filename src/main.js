// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Dropdown from 'hsy-vue-dropdown'
import Shortkey from 'vue-shortkey'
import VueThrottleEvent from 'vue-throttle-event'
import Buefy from 'buefy'
import Vuebar from 'vuebar'

import Capitalize from '@/vuePlugins/capitalize-filter'
import * as builtInControls from '@/modv/controls'
import * as builtInStatusBarItems from '@/extra/status-bar-items'
import * as builtInRenderers from '@/modv/renderers'

import { modV } from './modv'
import App from './App'
import store from './store'
import contextMenu from './extra/context-menu'
import expression from './extra/expression'
import midiAssignment from './extra/midi-assignment'
import featureAssignment from './extra/feature-assignment'
import lfo from './extra/lfo'
import grabCanvas from './extra/grab-canvas'
import slimUi from './extra/slim-ui'
import shadertoy from './extra/shadertoy'
// import capture from './extra/capture'
import './assets/styles/index.scss'

import attachResizeHandles from './extra/ui-resize/attach'

Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$modV', {
  get() {
    return modV
  }
})

Vue.use(Capitalize)

Vue.use(Vuebar)
Vue.use(Buefy, {
  defaultIconPack: 'fa'
})
Vue.use(VueThrottleEvent)
Vue.use(Dropdown)
Vue.use(Shortkey)

modV.use('plugin', contextMenu)
modV.use('plugin', featureAssignment)
modV.use('plugin', expression)
modV.use('plugin', midiAssignment)
modV.use('plugin', lfo)
modV.use('plugin', grabCanvas)
modV.use('plugin', slimUi)
modV.use('plugin', shadertoy)
// modV.use('plugin', capture)

Object.values(builtInControls).forEach(value => modV.use('control', value))

Object.values(builtInStatusBarItems).forEach(value =>
  modV.use('statusBar', value)
)

Object.values(builtInRenderers).forEach(value => modV.use('renderer', value))

/* eslint-disable no-new */
export default window.modVVue = new Vue({
  el: '#app',
  components: { App },
  data: {
    modV
  },
  mounted() {
    modV.start(this)

    const modules = [
      'Event',
      'Text',
      'Webcam',
      'Plasma',
      'ChromaticAbberation',
      'Wobble',
      'Neon',
      'Fisheye',
      'MirrorEdge',
      'EdgeDistort',
      'Polygon',
      // 'Concentrics',
      'Phyllotaxis',
      'Pixelate-2.0',
      'Ball-2.0',
      'Concentrics',
      'Concentrics-2.0',
      'Waveform-2.0',
      'Un-Deux-Trois',
      'OpticalFlowDistort-2.0',
      'MattiasCRT-2.0',
      'Doughnut_Generator',
      'Bulge',
      'Media',
      '3D'
    ]

    modules.forEach(fileName => {
      import(`@/modv/sample-modules/${fileName}`).then(Module => {
        modV.register(Module.default)
      })
    })

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
      'Luminosity.fs'
    ]

    isfSamples.forEach(fileName => {
      import(`@/modv/sample-modules/isf-samples/${fileName}`)
        .then(fragmentShader => {
          modV.register({
            meta: {
              name: fileName,
              author: '',
              version: '1.0.0',
              type: 'isf'
            },
            fragmentShader,
            vertexShader: 'void main() {isf_vertShaderInit();}'
          })
        })
        .catch(e => {
          throw new Error(e)
        })
    })

    attachResizeHandles()
  },
  template: '<App/>',
  store
})
