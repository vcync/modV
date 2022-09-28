import uuidv4 from "uuid/v4";
import Fuse from "fuse.js";

const keys = [];
const fuse = new Fuse(keys, { includeScore: true });

const state = {
  searchables: {
    // searchTerm: ['id', 'another-id']
  }
};

const getters = {
  search: state => term => {
    const searchResults = {};
    const searchTerm = term.toLowerCase();

    if (!searchTerm) {
      return searchResults;
    }

    const matchingKeys = fuse
      .search(searchTerm)
      .sort((a, b) => a.score - b.score)
      .map(result => result.item);

    for (let i = 0, len = matchingKeys.length; i < len; i++) {
      const itemsToAdd = state.searchables[matchingKeys[i]];

      for (let j = 0, len = itemsToAdd.length; j < len; j++) {
        const item = itemsToAdd[j];

        searchResults[item.id] = item;
      }
    }

    return searchResults;
  }
};

const actions = {
  addTerms(
    { commit },
    {
      terms,
      id,
      title,
      focusElement = false,
      type,
      isGLElement = true,
      focusParent = false
    }
  ) {
    if (!id) {
      id = uuidv4();
    }

    for (let i = 0, len = terms.length; i < len; i++) {
      const term = terms[i];

      commit("ADD_TERM_TO_SEARCHABLES", {
        term: term.toLowerCase(),
        id,
        title,
        focusElement,
        type,
        isGLElement,
        focusParent
      });
    }

    return id;
  },

  removeId({ commit }, { id }) {
    if (!id) {
      return;
    }

    commit("REMOVE_ID_FROM_TERM", id);
  }
};

const mutations = {
  ADD_TERM_TO_SEARCHABLES(
    state,
    { term, id, title, focusElement, type, isGLElement, focusParent }
  ) {
    if (!state.searchables[term]) {
      state.searchables[term] = [];
      fuse.add(term);
    }

    state.searchables[term].push({
      id,
      title,
      focusElement,
      type,
      isGLElement,
      focusParent
    });
  },

  REMOVE_ID_FROM_TERM(state, id) {
    const terms = Object.keys(state.searchables).reduce((obj, term) => {
      const index = state.searchables[term].findIndex(item => item.id === id);

      if (index > -1) {
        if (!obj[term]) {
          obj[term] = [];
        }

        obj[term].push(index);
      }

      return obj;
    }, {});

    const termsKeys = Object.keys(terms);
    for (let i = 0, len1 = termsKeys.length; i < len1; i++) {
      const term = termsKeys[i];
      const value = terms[term];

      for (let j = 0, len2 = value.length; j < len2; j++) {
        const index = value[j];

        state.searchables[term].splice(index, 1);
        if (state.searchables[term].length < 1) {
          fuse.remove(doc => doc === term);
        }
      }
    }
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
