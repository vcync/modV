/*
 * When loading a preset we want to swap the data from the preset with the current state
 * and make sure that only the "allowed" properties are moved, see sharedPropertyRestrictions.
 *
 * The idea is that this makes loading presets smooth and the end user will not see any
 * glitches in the render loop.
 */
export function SWAP(
  swap,
  getDefault,
  sharedPropertyRestrictions,
  setDefault = true,
) {
  return function (state) {
    const stateKeys = Object.keys(state);
    const swapIndexes = {};

    if (stateKeys.length) {
      // eslint-disable-next-line
      stateKeys.forEach((key) => {
        const isArray = Array.isArray(state[key]);

        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const stateChildKeys = Object.keys(state[key]);

            // eslint-disable-next-line
            if (isArray) {
              swapIndexes[key] = swap[key].length;
              swap[key].push(
                ...state[key].filter(
                  (...args) => !sharedPropertyRestrictions[key](...args),
                ),
              );

              state[key] = state[key].filter(sharedPropertyRestrictions[key]);
            } else {
              const restrictedKeys = sharedPropertyRestrictions[key](
                state[key],
              );

              // eslint-disable-next-line
              stateChildKeys.forEach((stateChildKey) => {
                if (restrictedKeys.indexOf(stateChildKey) < 0) {
                  swap[key][stateChildKey] = state[key][stateChildKey];
                  delete state[key][stateChildKey];
                }
              });
            }
          } else if (sharedPropertyRestrictions[key]) {
            swap[key] = state[key];
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
      swapKeys.forEach((key) => {
        const isArray = Array.isArray(swap[key]);

        if (sharedPropertyRestrictions) {
          if (typeof sharedPropertyRestrictions[key] === "function") {
            const swapChildKeys = Object.keys(swap[key]);

            if (isArray) {
              state[key] = [
                ...state[key],
                ...swap[key].slice(0, swapIndexes[key]),
              ];

              swap[key] = swap[key].slice(swapIndexes[key], swap[key].length);
            } else {
              const restrictedKeys = sharedPropertyRestrictions[key](swap[key]);

              // eslint-disable-next-line
              swapChildKeys.forEach((swapChildKey) => {
                if (restrictedKeys.indexOf(swapChildKey) < 0) {
                  state[key][swapChildKey] = swap[key][swapChildKey];
                }
              });
            }
          } else if (sharedPropertyRestrictions[key]) {
            if (isArray) {
              state[key] = [...swap[key]];
            } else {
              state[key] = { ...swap[key] };
            }
          }
        } else {
          if (isArray) {
            state[key] = [...state[key], ...swap[key]];
          } else {
            state[key] = { ...state[key], ...swap[key] };
          }
        }
      });
    }

    if (setDefault) {
      Object.assign(swap, getDefault());
    }
  };
}
