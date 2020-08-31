const MAX_SMOOTHING = 2;
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
  let value = smoothedFeatures[id];

  if (features[feature] >= value) {
    value = features[feature];
  } else if (value - smoothingValue > 0) {
    value -= smoothingValue;
  } else {
    value = features[feature];
  }

  smoothedFeatures[id] = value;

  return value;
}

export {
  getFeature,
  getFeatures,
  setFeatures,
  addSmoothingId,
  removeSmoothingId,
  getSmoothedFeature,
  MAX_SMOOTHING,
  SMOOTHING_STEP
};
