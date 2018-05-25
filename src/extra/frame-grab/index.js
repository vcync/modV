// import { modV } from 'modv';
// import { MenuItem } from 'nwjs-menu-browser';

const frameGrab = {
  name: 'Frame Grab',

  /* install
   * Only called when added as a Vue plugin,
   * this must be registered with vue before modV
   * to use vuex or vue
   */
  install(Vue, { store }) {
    if (!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;
  },

  /* modvInstall
   * Only called when added to modV.
   */
  modvInstall() { //eslint-disable-line
    // modV.addContextMenuHook({
    //  hook: 'rangeControl',
    //  buildMenuItem: this.createMenuItem.bind(this)
    // });
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
  processFrame({ canvas }) { //eslint-disable-line
    // grab the frame here
  },
};

export default frameGrab;
