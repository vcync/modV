import Vue from "vue";
// import cloneDeep from "lodash.clonedeep";

export default function SWAP(
  swap,
  temp,
  getDefault,
  sharedPropertyRestrictions
) {
  return function(state) {
    const stateKeys = Object.keys(state);

    if (stateKeys.length) {
      // eslint-disable-next-line
      stateKeys.forEach(key => {
        const isArray = Array.isArray(state[key]);

        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const restrictedKeys = sharedPropertyRestrictions[key](state[key]);
            const stateChildKeys = Object.keys(state[key]);

            if (isArray) {
              Vue.set(temp, key, []);
            } else {
              Vue.set(temp, key, {});
            }

            // eslint-disable-next-line
            stateChildKeys.forEach(stateChildKey => {
              if (restrictedKeys.indexOf(stateChildKey) < 0) {
                if (isArray) {
                  temp[key].push(state[key][stateChildKey]);
                  state[key].splice(stateChildKey, 1);
                } else {
                  Vue.set(temp[key], stateChildKey, state[key][stateChildKey]);
                  delete state[key][stateChildKey];
                }
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
        const isArray = Array.isArray(swap[key]);

        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const restrictedKeys = sharedPropertyRestrictions[key](swap[key]);
            const swapChildKeys = Object.keys(swap[key]);

            // eslint-disable-next-line
            swapChildKeys.forEach(swapChildKey => {
              if (restrictedKeys.indexOf(swapChildKey) < 0) {
                if (isArray) {
                  state[key].push(swap[key][swapChildKey]);
                } else {
                  Vue.set(state[key], swapChildKey, swap[key][swapChildKey]);
                }
              }
            });
          } else if (sharedPropertyRestrictions[key]) {
            if (isArray) {
              Vue.set(state, key, [...swap[key]]);
            } else {
              Vue.set(state, key, { ...swap[key] });
            }
          }
        } else {
          if (isArray) {
            Vue.set(state, key, [...state[key], ...swap[key]]);
          } else {
            Vue.set(state, key, { ...state[key], ...swap[key] });
          }
        }
      });
    } else {
      Object.assign(swap, getDefault());
    }

    Object.assign(swap, temp || getDefault());
  };
}
