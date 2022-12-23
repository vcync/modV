const state = {
  defaultFonts: ["serif", "sans-serif", "cursive", "monospace"],
  localFonts: []
};

const getters = {
  fonts: state => [
    ...state.defaultFonts,
    ...state.localFonts.map(font => font.fullName)
  ]
};

const mutations = {
  SET_LOCAL_FONTS(state, fonts = []) {
    state.localFonts = fonts;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations
};
