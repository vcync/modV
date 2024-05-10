import Vue from "vue";

const INFO_VIEW_ID_VAR = "$iVID";

function mouseover(id, $store) {
  return () => {
    $store.dispatch("infoView/setFocused", {
      id
    });
  };
}

Vue.directive("infoView", {
  // When the bound element is inserted into the DOM...
  async inserted(el, binding, vnode) {
    const { value } = binding;
    const {
      context: { $store }
    } = vnode;

    const id = await $store.dispatch("infoView/addDictionaryItem", {
      id: value.id,
      title: value.title,
      body: value.body
    });

    vnode[INFO_VIEW_ID_VAR] = id;

    el.addEventListener("mouseover", mouseover(id, $store), true);
  },

  async unbind(el, binding, vnode) {
    const {
      context: { $store }
    } = vnode;

    await $store.dispatch("infoView/removeDictionaryItem", {
      id: vnode[INFO_VIEW_ID_VAR]
    });
  }
});
