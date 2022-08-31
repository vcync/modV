import Vue from "vue";
import store from "../worker/store";

export default async function getPropDefault(
  module,
  propName,
  prop,
  useExistingData
) {
  const { random, type } = prop;
  let defaultValue = prop.default;

  if (store.state.dataTypes[type] && store.state.dataTypes[type].create) {
    const propData = useExistingData ? module.props[propName] : prop.default;

    return await store.state.dataTypes[type].create(
      propData,
      module.meta.isGallery,
      useExistingData
    );
  }

  if (useExistingData && typeof module.props?.[propName] !== "undefined") {
    return module.props[propName];
  }

  if (Array.isArray(defaultValue)) {
    defaultValue = Vue.observable(defaultValue);
  }

  if (
    typeof defaultValue !== "undefined" &&
    Array.isArray(defaultValue) &&
    random
  ) {
    return defaultValue[Math.floor(Math.random() * defaultValue.length)];
  }

  if (
    typeof defaultValue === "undefined" &&
    typeof module.data?.[propName] !== "undefined"
  ) {
    return module.data[propName];
  }

  return defaultValue;
}
