import lerp from "../utils/lerp";

const MAX_SMOOTHING = 1;
const SMOOTHING_STEP = 0.001;

let features = {};
const smoothedFeatures = {};

function getFeatures() {
  return features;
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
    smoothingValue,
  );

  return smoothedFeatures[id];
}

export {
  getFeature,
  getFeatures,
  setFeatures,
  addSmoothingId,
  removeSmoothingId,
  getSmoothedFeature,
  MAX_SMOOTHING,
  SMOOTHING_STEP,
};
