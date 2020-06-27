import Vue from "vue";
import uuidv4 from "uuid/v4";

const state = {
  focused: "",
  dictionary: {}
};

const actions = {
  addDictionaryItem({ commit }, item) {
    let id = item.id;
    let singular = true;

    if (!state.dictionary.id === id) {
      return id;
    }

    if (!id) {
      id = uuidv4();
      singular = false;
    }

    commit("ADD_TO_DICTIONARY", { ...item, id, singular });

    return id;
  },

  removeDictionaryItem({ commit }, { id }) {
    if (!id) {
      return;
    }

    commit("REMOVE_FROM_DICTIONARY", id);
  },

  setFocused({ commit }, { id }) {
    commit("SET_FOCUSED", id);
  }
};

const mutations = {
  SET_FOCUSED(state, id) {
    state.focused = id;
  },

  CLEAR_FOCUSED(state) {
    state.focused = "";
  },

  ADD_TO_DICTIONARY(state, item) {
    state.dictionary[item.id] = item;
  },

  REMOVE_FROM_DICTIONARY(state, id) {
    if (state.dictionary[id].singular) {
      return;
    }

    Vue.delete(state.dictionary, id);
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};
