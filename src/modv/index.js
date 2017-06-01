import EventEmitter2 from 'eventemitter2';
import { Module2D } from './Modules';
import Layer from './Layer';

class ModV extends EventEmitter2 {

  /**
   * [constructor description]
   * @param  {ModVOptions} options
   */
  constructor(store) {
    super();

    this.layers = store.getters['layers/allLayers'];
    this.registeredModules = store.getters['modVModules/registeredModules'];
    this.activeModules = store.getters['modVModules/activeModules'];
  }

  start() {
    this.previewCanvas = document.getElementById('preview-canvas');
    this.previewContext = this.previewCanvas.getContext('2d');

    requestAnimationFrame(this.loop.bind(this));
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.layers.forEach((Layer) => {
      Object.keys(Layer.modules).forEach((moduleName) => {
        this.activeModules[moduleName].draw(this.previewCanvas, this.previewContext);
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