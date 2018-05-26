import { modV } from 'modv';
// import { MenuItem } from 'nwjs-menu-browser';

const Worker = require('worker-loader!./worker.js'); //eslint-disable-line

class GrabCanvas {
  constructor() {
    this.worker = new Worker();

    this.store = null;
    this.vue = null;
    this.delta = 0;

    // Small version of the output canvas
    this.smallCanvas = document.createElement('canvas');
    this.smallContext = this.smallCanvas.getContext('2d');

    // Set the size
    this.smallCanvas.width = 240;
    this.smallCanvas.height = 240;

    // Set the amount of the selected areas per axis
    this.selectionX = 4;
    this.selectionY = 4;

    // Add the canvas to modV for testing purposes :D
    this.smallCanvas.style = 'position: absolute; top: 0px; right: 0px; width: 80px; height: 80px; z-index: 100000;';
    document.body.appendChild(this.smallCanvas);
  }

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

  /* install
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

  /* modvInstall
   * Only called when added to modV.
   */
  modvInstall() { //eslint-disable-line
    this.resize(modV.outputCanvas);
  }

  /* process
   * Called once every frame.
   * Useful for plugins which need to process data away from modV
   */
  process({ delta }) {
    this.delta = delta;
  }

  /* processValue
   * Called once every frame.
   * Allows access of each value of every active Module.
   * (see expression plugin for an example)
   */
  processValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line
  }

  /* processFrame
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
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
