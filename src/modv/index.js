import EventEmitter2 from 'eventemitter2';
import BeatDetektor from '@/extra/beatdetektor';
import store from '@/../store/';
import { Module2D, ModuleShader } from './Modules';
import Layer from './Layer';
import { scan, setSource } from './MediaStream';
import draw from './draw';
import setupWebGl from './webgl';

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

    this.useDetectedBpm = store.getters['tempo/detect'];
    this.bpm = store.getters['tempo/bpm'];

    this.beatDetektor = new BeatDetektor(85, 169);
    this.beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
    this.kick = false;

    this.mediaStreamScan = scan.bind(this);
    this.setMediaStreamSource = setSource.bind(this);

    this.width = 200;
    this.height = 200;

    this.webgl = setupWebGl(this);

    this.mainRaf = null;

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

    this.outputCanvas = document.createElement('canvas');
    this.outputContext = this.outputCanvas.getContext('2d');

    this.previewCanvas = document.getElementById('preview-canvas');
    this.previewContext = this.previewCanvas.getContext('2d');

    window.addEventListener('resize', () => {
      store.dispatch('size/resizePreviewCanvas');
    });

    this.videoStream = document.createElement('video');
    this.videoStream.autoplay = true;
    this.videoStream.muted = true;

    store.dispatch('windows/createWindow');

    mediaStreamScan().then((mediaStreamDevices) => {
      mediaStreamDevices.audio.forEach(source => store.commit('mediaStream/addAudioSource', { source }));
      mediaStreamDevices.video.forEach(source => store.commit('mediaStream/addVideoSource', { source }));

      let audioSourceId;
      let videoSourceId;

      if(store.getters['user/currentAudioSource']) {
        audioSourceId = store.getters['user/currentAudioSource'];
      } else if(mediaStreamDevices.audio.length > 0) {
        audioSourceId = mediaStreamDevices.audio[0].deviceId;
      }

      if(store.getters['user/setCurrentVideoSource']) {
        videoSourceId = store.getters['user/setCurrentVideoSource'];
      } else if (mediaStreamDevices.video.length > 0) {
        videoSourceId = mediaStreamDevices.video[0].deviceId;
      }

      return {
        audioSourceId,
        videoSourceId
      };
    }).then(setMediaStreamSource).then(({ audioSourceId, videoSourceId }) => {
      store.commit('user/setCurrentAudioSource', { sourceId: audioSourceId });
      store.commit('user/setCurrentVideoSource', { sourceId: videoSourceId });

      this.mainRaf = requestAnimationFrame(this.loop.bind(this));
    });
    store.dispatch('size/resizePreviewCanvas');
  }

  loop(δ) {
    this.mainRaf = requestAnimationFrame(this.loop.bind(this));
    let features = [];
    if(this.audioFeatures.length > 0) features = this.meyda.get(this.audioFeatures);
    if(features) {
      this.activeFeatures = features;

      this.beatDetektor.process((δ / 1000.0), features.complexSpectrum.real);
      this.updateBPM(this.beatDetektor.win_bpm_int_lo);
    }

    this.beatDetektorKick.process(this.beatDetektor);
    this.kick = this.beatDetektorKick.isKick();


    draw(δ);
  }

  register(Module) { //eslint-disable-line
    store.dispatch('modVModules/register', { Module });
  }

  resize(width, height, dpr = 1) {
    this.width = width * dpr;
    this.height = height * dpr;
    this.bufferCanvas.width = this.width;
    this.bufferCanvas.height = this.height;
    this.outputCanvas.width = this.width;
    this.outputCanvas.height = this.height;
  }

  updateBPM(newBpm) {
    this.bpm = store.getters['tempo/bpm'];
    this.useDetectedBpm = store.getters['tempo/detect'];

    if(!newBpm || !this.useDetectedBpm) return;

    const bpm = Math.round(newBpm);
    if(this.bpm !== bpm) {
      store.commit('tempo/setBpm', { bpm });
    }
  }

  /** @return {WorkersDataType} */
  createWorkers() {//eslint-disable-line
    // const palette = new PaletteWorker();
    // palette.on(PaletteWorker.EventType.PALETTE_ADDED, this.paletteAddHandler.bind(this));
    // palette.on(PaletteWorker.EventType.PALETTE_UPDATED, this.paletteUpdateHandler.bind(this));

    // return {
    //   palette,
    // };
  }

  /**
   * @protected
   * @param {string} id
   * @param {*} currentColor
   * @param {*} currentStep
   * @todo Types
   */
  paletteUpdateHandler(id, currentColor, currentStep) {
    this.palettes.set(id, {
      currentColor,
      currentStep
    });
  }

  /** @param {string} id */
  removePalette(id) {
    this.palettes.delete(id);
    this.workers.palette.removePalette(id);
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
const webgl = modV.webgl;

export default modV;
export {
  modV,
  Module2D,
  ModuleShader,
  Layer,
  webgl
};