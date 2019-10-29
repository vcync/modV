import Vue from "vue";
import cloneDeep from "lodash.clonedeep";

export default function SWAP(swap, temp, getDefault) {
  return function(state) {
    temp = cloneDeep(state);

    const stateKeys = Object.keys(state);

    if (stateKeys.length) {
      // eslint-disable-next-line
      stateKeys.forEach(key => {
        Vue.set(temp, key, state[key]);
      });
    } else {
      Object.assign(temp, getDefault());
    }

    const swapKeys = Object.keys(swap);

    if (swapKeys.length) {
      // eslint-disable-next-line
      swapKeys.forEach(key => {
        Vue.set(state, key, swap[key]);
      });
    } else {
      Object.assign(state, getDefault());
    }

    const tempKeys = Object.keys(temp);

    if (tempKeys.length) {
      // eslint-disable-next-line
      tempKeys.forEach(key => {
        Vue.set(swap, key, temp[key]);
      });
    } else {
      Object.assign(swap, getDefault());
    }

    Object.assign(temp, getDefault());
  };
}
