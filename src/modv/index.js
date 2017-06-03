import EventEmitter2 from 'eventemitter2';
import store from '@/../store/';
import { Module2D } from './Modules';
import Layer from './Layer';
import { scan as mediaStreamScan, setSource as setMediaStreamSource } from './MediaStream';

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
    this.getActiveModule = store.getters['modVModules/getActiveModule'];
    this.windows = store.getters['windows/allWindows'];
    this.windowReference = store.getters['windows/windowReference'];
    this.audioFeatures = store.getters['meyda/features'];
    this.mediaStreamDevices = {
      audio: store.getters['mediaStream/audioSources'],
      video: store.getters['mediaStream/videoSources']
    };

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

    this.videoStream = document.createElement('video');
    this.videoStream.autoplay = true;
    this.videoStream.muted = true;

    store.dispatch('windows/createWindow');

    mediaStreamScan().then((mediaStreamDevices) => {
      mediaStreamDevices.audio.forEach(source => store.commit('mediaStream/addAudioSource', { source }));
      mediaStreamDevices.video.forEach(source => store.commit('mediaStream/addVideoSource', { source }));
      return {
        audioSourceId: mediaStreamDevices.audio[0].deviceId,
        videoSourceId: mediaStreamDevices.video[0].deviceId
      };
    }).then(setMediaStreamSource.bind(this)).then(() => {
      requestAnimationFrame(this.loop.bind(this));
    });
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));

    if(!this.meyda) return;
    const features = this.meyda.get(this.audioFeatures);
    const windowController = this.windows[0];
    const canvas = windowController.canvas;
    const context = windowController.context;

    context.clearRect(0, 0, canvas.width, canvas.height);

    this.layers.forEach((Layer) => {
      Object.keys(Layer.modules).forEach((moduleName) => {
        const Module = this.getActiveModule(moduleName);

        if(!Module.info.enabled || Module.info.alpha === 0) return;

        context.save();
        context.globalAlpha = Module.info.alpha || 1;
        context.globalCompositeOperation = Module.info.compositeOperation;
        Module.draw(canvas, context, this.videoStream, features);
        context.restore();
      });
    });
  }

  register(Module) { //eslint-disable-line
    store.dispatch('modVModules/register', { Module });
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