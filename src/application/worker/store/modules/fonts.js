const state = {
  defaultFonts: ["serif", "sans-serif", "cursive", "monospace"],
  localFonts: []
};

const getters = {
  fonts: state => [
    ...state.defaultFonts,
    ...state.localFonts
      .filter(
        (value, index, self) =>
          index === self.findIndex(t => t.family === value.family)
      )
      .map(font => font.family)
      .sort((a, b) => a.localeCompare(b))
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
