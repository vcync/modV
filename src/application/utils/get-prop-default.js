import store from "../worker/store";

export default async function getPropDefault(
  module,
  propName,
  prop,
  useExistingData
) {
  const { default: defaultValue, random, type } = prop;

  if (store.state.dataTypes[type] && store.state.dataTypes[type].create) {
    const propData = useExistingData ? module.props[propName] : prop.default;

    return await store.state.dataTypes[type].create(
      propData,
      module.meta.isGallery
    );
  }

  if (useExistingData && typeof module.props?.[propName] !== "undefined") {
    return module.props[propName];
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
