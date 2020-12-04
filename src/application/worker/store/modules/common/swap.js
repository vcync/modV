import Vue from "vue";

/*
 * When loading a preset we want to swap the data from the preset with the current state
 * and make sure that only the "allowed" properties are moved, see sharedPropertyRestrictions.
 *
 * The idea is that this makes loading presets smooth and the end user will not see any
 * glitches in the render loop.
 */
export default function SWAP(swap, getDefault, sharedPropertyRestrictions) {
  return function(state) {
    const stateKeys = Object.keys(state);

    if (stateKeys.length) {
      // eslint-disable-next-line
      stateKeys.forEach(key => {
        const isArray = Array.isArray(state[key]);

        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const stateChildKeys = Object.keys(state[key]);

            // eslint-disable-next-line
            if (isArray) {
              state[key] = state[key].filter(
                sharedPropertyRestrictions[key](state[key])
              );
            } else {
              const restrictedKeys = sharedPropertyRestrictions[key](
                state[key]
              );

              // eslint-disable-next-line
              stateChildKeys.forEach(stateChildKey => {
                if (restrictedKeys.indexOf(stateChildKey) < 0) {
                  delete state[key][stateChildKey];
                }
              });
            }
          } else if (sharedPropertyRestrictions[key]) {
            delete state[key];
          }
        } else {
          delete state[key];
        }
      });
    }

    const swapKeys = Object.keys(swap);

    if (swapKeys.length) {
      // eslint-disable-next-line
      swapKeys.forEach(key => {
        const isArray = Array.isArray(swap[key]);

        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const swapChildKeys = Object.keys(swap[key]);

            if (isArray) {
              state[key] = swap[key].filter(
                sharedPropertyRestrictions[key](swap[key])
              );
            } else {
              const restrictedKeys = sharedPropertyRestrictions[key](swap[key]);

              // eslint-disable-next-line
              swapChildKeys.forEach(swapChildKey => {
                if (restrictedKeys.indexOf(swapChildKey) < 0) {
                  Vue.set(state[key], swapChildKey, swap[key][swapChildKey]);
                }
              });
            }
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

    Object.assign(swap, getDefault());
  };
}
