import Vue from "vue";
import vgl from "vue-golden-layout";
import "golden-layout/src/css/goldenlayout-dark-theme.css";

import App from "./App.vue";
import ModV from "./application";
import store from "./ui-store";
import contextMenuPlugin from "./application/plugins/context-menu";

Vue.config.productionTip = false;
Vue.use(vgl);

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
