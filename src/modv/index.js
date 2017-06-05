import EventEmitter2 from 'eventemitter2';
import store from '@/../store/';
import { Module2D } from './Modules';
import Layer from './Layer';
import { scan, setSource } from './MediaStream';
import mux from './mux';

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

    this.mediaStreamScan = scan.bind(this);
    this.setMediaStreamSource = setSource.bind(this);

    window.addEventListener('unload', () => {
      this.windows.forEach((windowController) => {
        const windowRef = this.windowReference(windowController.window);
        windowRef.close();
      });
    });
  }

  start() {
    const mediaStreamScan = this.mediaStreamScan;
    const setMediaStreamSource = this.setMediaStreamSource;

    this.bufferCanvas = document.createElement('canvas');
    this.bufferContext = this.bufferCanvas.getContext('2d');

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
    }).then(setMediaStreamSource).then(({ audioSourceId, videoSourceId }) => {
      store.commit('mediaStream/setCurrentAudioSource', { sourceId: audioSourceId });
      store.commit('mediaStream/setCurrentVideoSource', { sourceId: videoSourceId });
      requestAnimationFrame(this.loop.bind(this));
    });
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));

    if(!this.meyda) return;
    const features = this.meyda.get(this.audioFeatures);

    this.layers.forEach((Layer) => {
      const canvas = Layer.canvas;
      const context = Layer.context;

      context.clearRect(0, 0, canvas.width, canvas.height);

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

    mux.bind(this)();
  }

  register(Module) { //eslint-disable-line
    store.dispatch('modVModules/register', { Module });
  }

  resize(width, height, dpr = 1) {
    this.width = width * dpr;
    this.height = height * dpr;
    this.bufferCanvas.width = this.width;
    this.bufferCanvas.height = this.height;

    this.layers.forEach((Layer) => {
      Layer.resize({ width: this.width, height: this.height });
    });
  }

  static get Layer() {
    return Layer;
  }

  static get Module2D() {
    return Module2D;
  }
}

const modV = new ModV();

window.modV = modV;

export default modV;
export {
  modV,
  Module2D,
  Layer
};