import featureStoreModule from "./store";

export default {
  name: "Feature Assignment",
  store: featureStoreModule,

  preProcessFrame({ features, store }) {
    if (!features) {
      return;
    }

    const availableFeatures = Object.keys(features);
    const availableFeaturesLength = availableFeatures.length;

    for (let i = 0; i < availableFeaturesLength; ++i) {
      const feature = availableFeatures[i];
      if (featureStoreModule.state[feature]) {
        const featureData = features[feature];
        const modulesToUpdate = Object.keys(featureStoreModule.state[feature]);
        const modulesToUpdateLength = modulesToUpdate.length;

        for (let j = 0; j < modulesToUpdateLength; ++j) {
          const moduleId = modulesToUpdate[j];
          const props = featureStoreModule.state[feature][moduleId];

          for (let k = 0; k < props.length; ++k) {
            const prop = props[k];
            store.dispatch("modules/updateProp", {
              moduleId,
              prop,
              data: featureData,
            });
          }
        }
      }
    }
  },
};
