import Vue from "vue";
// import cloneDeep from "lodash.clonedeep";

export default function SWAP(
  swap,
  temp,
  getDefault,
  sharedPropertyRestrictions
) {
  return function(state) {
    // temp = cloneDeep(state);

    const stateKeys = Object.keys(state);

    if (stateKeys.length) {
      // eslint-disable-next-line
      stateKeys.forEach(key => {
        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const restrictedKeys = sharedPropertyRestrictions[key](state[key]);
            const keyKeys = Object.keys(state[key]);
            Vue.set(temp, key, {});
            // eslint-disable-next-line
            keyKeys.forEach(keyKey => {
              if (restrictedKeys.indexOf(keyKey) < 0) {
                Vue.set(temp[key], keyKey, state[key][keyKey]);
                delete state[key][keyKey];
              }
            });
          } else if (sharedPropertyRestrictions[key]) {
            Vue.set(temp, key, state[key]);
            delete state[key];
          }
        } else {
          Vue.set(temp, key, state[key]);
          delete state[key];
        }
      });
    } else {
      Object.assign(temp, getDefault());
    }

    const swapKeys = Object.keys(swap);

    if (swapKeys.length) {
      // eslint-disable-next-line
      swapKeys.forEach(key => {
        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const restrictedKeys = sharedPropertyRestrictions[key](swap[key]);
            const keyKeys = Object.keys(swap[key]);
            // eslint-disable-next-line
            keyKeys.forEach(keyKey => {
              if (restrictedKeys.indexOf(keyKey) < 0) {
                Vue.set(state[key], keyKey, swap[key][keyKey]);
              }
            });
          } else if (sharedPropertyRestrictions[key]) {
            Vue.set(state, key, { ...state[key], ...swap[key] });
          }
        } else {
          Vue.set(state, key, { ...state[key], ...swap[key] });
        }
      });
    } else {
      Object.assign(swap, getDefault());
    }

    Object.assign(swap, temp || getDefault());
  };
}
