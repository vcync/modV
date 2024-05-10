const SEARCH_ID_VAR = "$searchId";

export const installSearch = (app) => {
  app.directive("searchTerms", {
    // When the bound element is inserted into the DOM...
    async inserted(el, binding, vnode) {
      const { value } = binding;
      const {
        context: { $store },
      } = vnode;

      const id = await $store.dispatch("search/addTerms", {
        ...value,
      });

      vnode[SEARCH_ID_VAR] = id;
      el.setAttribute("data-searchId", id);
    },

    async unbind(el, binding, vnode) {
      const {
        context: { $store },
      } = vnode;

      await $store.dispatch("search/removeId", {
        id: vnode[SEARCH_ID_VAR],
      });
    },
  });
};
