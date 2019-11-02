import store from "../worker/store";

export default async function getPropDefault(module, propName, prop) {
  const { default: defaultValue, random, type } = prop;

  if (
    typeof defaultValue !== "undefined" &&
    Array.isArray(defaultValue) &&
    random
  ) {
    return defaultValue[Math.floor(Math.random() * defaultValue.length)];
  }

  if (store.state.dataTypes[type] && store.state.dataTypes[type].create) {
    return await store.state.dataTypes[type].create(prop.default);
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
