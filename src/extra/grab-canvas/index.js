import store from '@/../store';
import { modV } from 'modv';
import controlPanelComponent from './ControlPanel';

const Worker = require('worker-loader!./worker.js'); //eslint-disable-line

const theWorker = new Worker();

const grabCanvas = {
  name: 'Grab Canvas',
  controlPanelComponent,

  resize(canvas) {
    if (!canvas) return;

    theWorker.postMessage({
      type: 'setup',
      payload: {
        width: canvas.width,
        height: canvas.height,
        devicePixelRatio: window.devicePixelRatio,
      },
    });
  },

  /* install
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue) {
    Vue.component(controlPanelComponent.name, controlPanelComponent);

    store.subscribe((mutation) => {
      if (mutation.type === 'windows/setSize') {
        this.resize({
          width: mutation.payload.width,
          height: mutation.payload.height,
        });
      }
    });
  },

  /* modvInstall
   * Only called when added to modV.
   */
  modvInstall() { //eslint-disable-line
    this.resize(modV.outputCanvas);
  },

  /* process
   * Called once every frame.
   * Useful for plugins which need to process data away from modV
   */
  process({ delta }) { //eslint-disable-line
    // this.delta = delta;
  },

  /* processValue
   * Called once every frame.
   * Allows access of each value of every active Module.
   * (see expression plugin for an example)
   */
  processValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line

  },

  /* processFrame
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
   */
  processFrame({ canvas, context }) { //eslint-disable-line
    //
    // Consider using the delta value to throttle the frame dumping
    // for a performance boost
    // if (this.delta % 2 === 0) {
    //
    // }
    //

    // const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    // theWorker.postMessage({
    //   type: 'data',
    //   payload: pixels,
    // });
  },
};

export default grabCanvas;
