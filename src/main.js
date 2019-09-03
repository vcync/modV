import Vue from "vue";
import App from "./App.vue";
import ModV from "./application";
import store from "./ui-store";
import contextMenuPlugin from "./application/plugins/context-menu";

Vue.config.productionTip = false;
const modV = new ModV();
window.modV = modV;

modV.use("plugin", contextMenuPlugin);

Object.defineProperty(Vue.prototype, "$modV", {
  get() {
    return modV;
  }
});

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
