import store from "@/store";

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

  if (useExistingData && module.props && module.props[propName]) {
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
    module.data &&
    module.data[propName]
  ) {
    return module.data[propName];
  }

  return defaultValue;
}
