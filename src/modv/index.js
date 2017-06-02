import EventEmitter2 from 'eventemitter2';
import store from '@/../store/';
import { Module2D } from './Modules';
import Layer from './Layer';

class ModV extends EventEmitter2 {

  /**
   * [constructor description]
   * @param  {ModVOptions} options
   */
  constructor() {
    super();

    this.layers = store.getters['layers/allLayers'];
    this.registeredModules = store.getters['modVModules/registeredModules'];
    this.activeModules = store.getters['modVModules/activeModules'];
    this.windows = store.getters['windows/allWindows'];
    this.windowReference = store.getters['windows/windowReference'];

    window.addEventListener('unload', () => {
      this.windows.forEach((windowController) => {
        const windowRef = this.windowReference(windowController.window);
        windowRef.close();
      });
    });
  }

  start() {
    this.previewCanvas = document.getElementById('preview-canvas');
    this.previewContext = this.previewCanvas.getContext('2d');

    store.dispatch('windows/createWindow');

    requestAnimationFrame(this.loop.bind(this));
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.layers.forEach((Layer) => {
      Object.keys(Layer.modules).forEach((moduleName) => {
        this.activeModules[moduleName].draw(this.windows[0].canvas, this.windows[0].context);
      });
    });
  }

  static get Layer() {
    return Layer;
  }

  static get Module2D() {
    return Module2D;
  }
}

export default ModV;
export {
  ModV,
  Module2D,
  Layer
};