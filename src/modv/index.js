import EventEmitter2 from 'eventemitter2';
import BeatDetektor from '@/extra/beatdetektor';
import store from '@/../store/';
import { Module2D, ModuleShader } from './Modules';
import Layer from './Layer';
import { scan, setSource } from './MediaStream';
import draw from './draw';
import setupWebGl from './webgl';
import PaletteWorker from './palette-worker';

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
    this.palettes = store.getters['palettes/allPalettes'];

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

  loop(δ) {
    requestAnimationFrame(this.loop.bind(this));
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
  createWorkers() {
    const palette = new PaletteWorker();
    palette.on(PaletteWorker.EventType.PALETTE_ADDED, this.paletteAddHandler.bind(this));
    palette.on(PaletteWorker.EventType.PALETTE_UPDATED, this.paletteUpdateHandler.bind(this));

    return {
      palette,
    };
  }

  /**
   * @protected
   * @param {string} id
   */
  paletteAddHandler(id) {
    if(!this.palettes.has(id)) {
      this.palettes.set(id, {});
    } else {
      console.error('Palette with ID', id, 'already exists');
    }
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