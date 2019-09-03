import Vue from "vue";

export default function SWAP(swap, temp) {
  return function(state) {
    Vue.set(temp, state);
    Vue.set(state, swap);
    Vue.set(swap, temp);
    temp = [];
  };
}
