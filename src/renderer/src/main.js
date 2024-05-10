// import './assets/main.css'

// import Vue from "vue";
// import App from './App.vue'

// window.Vue = new Vue({
//   render: h => h(App),
// });

// window.Vue.$mount("#app");

///

import Vue from "vue";
// import vgl from "vue-golden-layout";
import get from "lodash.get";
import Fragment from "vue-fragment";

import "./components/inputs/index.js";
import ElectronLink from "./components/ElectronLink.vue";
import "./components/directives/InfoView.js";
import "./components/directives/Search.js";
import "./components/directives/ValueTooltip.js";
import "./components/directives/ContextMenu.js";

import App from "./App.vue";
import modV from "./application";
import store from "./ui-store";

const { ipcRenderer } = window.electron;

Vue.config.ignoredElements = ["grid", "c"];
Vue.config.productionTip = false;
// Vue.use(vgl);
Vue.use(Fragment.Plugin);
Vue.component("ElectronLink", ElectronLink);

window.modV = modV;

Object.defineProperty(Vue.prototype, "$modV", {
  get() {
    return modV;
  }
});

window.Vue = new Vue({
  render: h => h(App),
  store
});

// const app = window.Vue = createApp(App);
// app.use(store);

// export {
//   app
// }

// For Playwright
window._get = get;

async function start() {
  ipcRenderer.send("main-window-created");
  const loadingElement = document.getElementById("loading");

  // eslint-disable-next-line no-for-each/no-for-each
  "loading".split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style = `animation-delay: ${index * 60}ms`;
    loadingElement.appendChild(span);
  });

  await modV.ready;
  modV.setup();

  loadingElement.remove();
  window.Vue.$mount("#app");
}

start();
