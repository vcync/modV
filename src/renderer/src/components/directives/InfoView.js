import store from "../../ui-store/index.js";

const INFO_VIEW_ID_VAR = "$iVID";

function mouseover(id) {
  return () => {
    store.dispatch("infoView/setFocused", {
      id,
    });
  };
}

export const InfoView = {
  install: (app) => {
    app.directive("infoView", {
      // When the bound element is inserted into the DOM...
      async mounted(el, binding, vnode) {
        const { value } = binding;

        const id = await store.dispatch("infoView/addDictionaryItem", {
          id: value.id,
          title: value.title,
          body: value.body,
        });

        vnode[INFO_VIEW_ID_VAR] = id;

        el.addEventListener("mouseover", mouseover(id), true);
      },

      async unmounted(el, binding, vnode) {
        await store.dispatch("infoView/removeDictionaryItem", {
          id: vnode[INFO_VIEW_ID_VAR],
        });
      },
    });
  },
};
