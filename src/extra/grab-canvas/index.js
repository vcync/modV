import { modV } from 'modv';

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
class GrabCanvas {
  constructor(args = {}) {
    this.worker = new Worker();

    this.store = null;
    this.vue = null;
    this.delta = 0;

    // Small version of the output canvas
    this.smallCanvas = document.createElement('canvas');
    this.smallContext = this.smallCanvas.getContext('2d');

    // Set the size of the smallCanvas
    this.smallCanvas.width = args.width || 240;
    this.smallCanvas.height = args.height || 240;

    // Set the amount of the selected areas per axis
    this.selectionX = args.selectionX || 4;
    this.selectionY = args.selectionY || 4;

    // Add the canvas to modV for testing purposes :D
    this.smallCanvas.style = 'position: absolute; top: 0px; right: 0px; width: 80px; height: 80px; z-index: 100000;';
    document.body.appendChild(this.smallCanvas);
  }

  /**
   * When the canvas is resized: Update the worker.
   *
   * @param{Object} canvas - The modV output canvas
   */
  resize(canvas) {
    if (!canvas) return;

    this.worker.postMessage({
      type: 'setup',
      payload: {
        width: this.smallCanvas.width,
        height: this.smallCanvas.height,
        selectionX: this.selectionX,
        selectionY: this.selectionY,
      },
    });
  }

  /**
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue, { store }) {
    if (!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;

    store.subscribe((mutation) => {
      if (mutation.type === 'windows/setSize') {
        this.resize({
          width: mutation.payload.width,
          height: mutation.payload.height,
        });
      }
    });
  }

  /**
   * Only called when added to modV.
   */
  modvInstall() { //eslint-disable-line
    this.resize(modV.outputCanvas);
  }

  /**
   * Called once every frame.
   * Useful for plugins which need to process data away from modV
   */
  process({ delta }) {
    this.delta = delta;
  }

  /**
   * Called once every frame.
   * Allows access of each value of every active Module.
   * (see expression plugin for an example)
   */
  processValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line
  }

  /**
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
   *
   * @param{Object} canvas - The modV output canvas
   * @param{Object} context - The modV output context
   */
  processFrame({ canvas, context }) { //eslint-disable-line

    // Clear the output
    this.smallContext.clearRect(0, 0, this.smallCanvas.width, this.smallCanvas.height);

    // Create a small version of the canvas
    this.smallContext.drawImage(canvas, 0, 0, this.smallCanvas.width, this.smallCanvas.height);

    // Get the pixels from the small canvas
    const data =
      this.smallContext.getImageData(0, 0, this.smallCanvas.width, this.smallCanvas.height).data;

    // Send the data to the worker
    this.worker.postMessage({
      type: 'data',
      payload: data,
    });
  }
}

const grabCanvas = new GrabCanvas();

export default grabCanvas;
