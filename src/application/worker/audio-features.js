import Meyda from "meyda";
import BeatDetektor from "../../../lib/BeatDetektor";
import lerp from "../utils/lerp";
import store from "./store";

const MAX_SMOOTHING = 1;
const SMOOTHING_STEP = 0.001;

let features = {};
const smoothedFeatures = {};

let frame;
let frameReader;
let stream;

let beatDetektor;
let beatDetektorKick;

const setupBeatDetektor = () => {
  beatDetektor = new BeatDetektor(120, 180);
  beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
};

const updateBeatDetektor = (delta, features) => {
  if (!features) {
    return;
  }
  if (!beatDetektor) {
    setupBeatDetektor();
  }
  beatDetektor.process(delta / 1000.0, features.complexSpectrum.real);
  beatDetektorKick.process(beatDetektor);
  const kick = beatDetektorKick.isKick();
  const bpm = beatDetektor.win_bpm_int_lo;

  store.commit("beats/SET_KICK", { kick });
  if (store.state.beats.bpm !== bpm) {
    store.dispatch("beats/setBpm", { bpm, source: "beatdetektor" });
  }
};

function processFrame({ done, value: newFrame }) {
  if (done) {
    frameReader.releaseLock();
    stream.cancel();
    return;
  }

  frame = newFrame;
}

function getFeatures() {
  return new Promise(resolve => {
    const {
      meyda: { features: featuresToGet }
    } = store.state;

    if (!frame) {
      return;
    }

    let size = 0;
    try {
      size = frame.allocationSize({ planeIndex: 0 });
    } catch (_) {
      return;
    }

    Meyda.bufferSize = size;

    const buffer = new ArrayBuffer(size);

    frame.copyTo(buffer, { planeIndex: 0 });

    features = Meyda.extract(featuresToGet, new Float32Array(buffer));
    updateBeatDetektor(performance.now(), features);
    resolve(features);

    frame.close();

    frameReader.read().then(processFrame);
  });
}

function getFeature(key) {
  return features[key];
}

function setFeatures(newFeatures) {
  features = newFeatures;
}

function addSmoothingId(id) {
  smoothedFeatures[id] = 0;
}

function removeSmoothingId(id) {
  delete smoothedFeatures[id];
}

function getSmoothedFeature(feature, id, smoothingValue) {
  smoothedFeatures[id] = lerp(
    smoothedFeatures[id] || 0,
    features[feature],
    smoothingValue
  );

  return smoothedFeatures[id];
}

async function setupAudioStream(frameStream) {
  stream = frameStream;
  if (!frameStream) {
    return;
  }

  frameReader = frameStream.getReader();

  frameReader.read().then(processFrame);
}

export {
  getFeature,
  getFeatures,
  setFeatures,
  addSmoothingId,
  removeSmoothingId,
  getSmoothedFeature,
  setupAudioStream,
  MAX_SMOOTHING,
  SMOOTHING_STEP
};
