let features = {};

function getFeatures() {
  return features;
}

function getFeature(key) {
  return features[key];
}

function setFeatures(newFeatures) {
  features = newFeatures;
}

export { getFeature, getFeatures, setFeatures };
