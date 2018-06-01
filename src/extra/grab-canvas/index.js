import store from '@/../store';
import { modV } from 'modv';
import controlPanelComponent from './ControlPanel';
import grabCanvasStore from './store';


const Worker = require('worker-loader!./worker.js'); //eslint-disable-line

/**
 * A module to grab data from the modVs output canvas to put it on
 * it's own "smallCanvas" (which is very small in terms of size to improve peformance)
 * and then send the pixel-data to luminave (https://github.com/NERDDISCO/luminave)
 * luminave is using the data to control other kind of lights (for example DMX512)
 *
 * @param{number} width - Width of the smallCanvas
 * @param{number} height - Height of the smallCanvas
 * @param{number} selectionX - Amount of areas we select on the x-axis
 * @param{number} selectionY - Amount of areas we select on the y-axis
 */
const theWorker = new Worker();

// Small version of the output canvas
const smallCanvas = document.createElement('canvas');
const smallContext = smallCanvas.getContext('2d');

// Add the canvas to modV for testing purposes :D
smallCanvas.style = 'position: absolute; top: 0px; right: 0px; width: 80px; height: 80px; z-index: 100000;';
document.body.appendChild(smallCanvas);

const grabCanvas = {
  name: 'Grab Canvas',
  controlPanelComponent,

  /**
   * When the canvas is resized: Update the worker.
   *
   * @param{Object} canvas - The modV output canvas
   */
  resize(canvas) {
    if (!canvas) return;

    theWorker.postMessage({
      type: 'setup',
      payload: {
        width: smallCanvas.width,
        height: smallCanvas.height,
        selectionX: store.getters['grabCanvas/selectionX'],
        selectionY: store.getters['grabCanvas/selectionY'],
      },
    });
  },

  /**
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue, args = {}) {
    Vue.component(controlPanelComponent.name, controlPanelComponent);

    store.registerModule('grabCanvas', grabCanvasStore);

    // Set the size of the smallCanvas
    smallCanvas.width = args.width || 240;
    smallCanvas.height = args.height || 240;

    // Set the amount of the selected areas per axis
    store.commit('grabCanvas/setSelection', {
      selectionX: args.selectionX || 4,
      selectionY: args.selectionY || 4,
    });

    store.subscribe((mutation) => {
      if (mutation.type === 'windows/setSize') {
        this.resize({
          width: mutation.payload.width,
          height: mutation.payload.height,
        });
      } else if (mutation.type === 'grabCanvas/setSelection') {
        theWorker.postMessage({
          type: 'setup',
          payload: {
            width: smallCanvas.width,
            height: smallCanvas.height,
            selectionX: mutation.payload.selectionX || store.getters['grabCanvas/selectionX'],
            selectionY: mutation.payload.selectionY || store.getters['grabCanvas/selectionY'],
          },
        });
      }
    });
  },

  /**
   * Only called when added to modV.
   */
  modvInstall() {
    this.resize(modV.outputCanvas);
  },

  /**
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
   *
   * @param{Object} canvas - The modV output canvas
   */
  processFrame({ canvas }) {
    // Clear the output
    smallContext.clearRect(0, 0, smallCanvas.width, smallCanvas.height);

    // Create a small version of the canvas
    smallContext.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);

    // Get the pixels from the small canvas
    const data =
      smallContext.getImageData(0, 0, smallCanvas.width, smallCanvas.height).data;

    // Send the data to the worker
    theWorker.postMessage({

      type: 'data',
      payload: data,
    });
  },
};

export default grabCanvas;
