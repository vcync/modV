import Vue from "vue";
import uuidv4 from "uuid/v4";

const state = {
  messages: {}
};

const actions = {
  createMessage({ commit }, { message }) {
    if (!message) {
      throw new Error("No message given");
    }

    commit("CREATE_MESSAGE", { message, id: uuidv4() });
  }
};

const mutations = {
  CREATE_MESSAGE(state, { message, id }) {
    Vue.set(state.messages, id, message);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
