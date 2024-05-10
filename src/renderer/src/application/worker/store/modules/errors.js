import Vue from "vue";
import { v4 as uuidv4 } from "uuid";

const state = {
  messages: {}
};

const actions = {
  createMessage({ commit }, { message }) {
    if (!message) {
      throw new Error("No message given");
    }

    commit("CREATE_MESSAGE", { message, id: uuidv4() });
  },

  deleteMessage({ commit }, { id }) {
    commit("REMOVE_MESSAGE", { id });
  }
};

const mutations = {
  CREATE_MESSAGE(state, { message, id }) {
    Vue.set(state.messages, id, message);
  },

  REMOVE_MESSAGE(state, { id }) {
    Vue.delete(state.messages, id);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
