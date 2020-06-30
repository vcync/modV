import Vue from "vue";
import controlMixin from "@/components/ControlPanel/control-mixin";

const state = {};

const actions = {
  addControl({ commit }, control) {
    if (!("name" in control)) throw new Error("Control must have a name");

    if (!("component" in control))
      throw new Error("Control must have a component");

    Vue.component(
      control.name,
      Vue.extend({
        mixins: [controlMixin, control.component]
      })
    );

    commit("addControl", { control });
  }
};

const mutations = {
  addControl(state, { control }) {
    Vue.set(state, control.name, control);
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
