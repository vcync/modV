import Vue from "vue";
import vgl from "vue-golden-layout";
import "golden-layout/src/css/goldenlayout-dark-theme.css";

import App from "./App.vue";
import ModV from "./application";
import store from "./ui-store";
import contextMenuPlugin from "./application/plugins/context-menu";

Vue.config.ignoredElements = ["grid", "c"];
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

require("electron").ipcRenderer.on("media-manager-update", (event, message) => {
  const parsedMessage = JSON.parse(message);
  if (!parsedMessage) {
    return;
  }

  const img = new Image();
  img.src = `file://${parsedMessage.payload.item.path}`;
  document.body.appendChild(img);
  console.log(parsedMessage);
});

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
