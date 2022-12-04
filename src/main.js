import Vue from "vue";
import vgl from "vue-golden-layout";
import Fragment from "vue-fragment";
import "./components/inputs";
import ElectronLink from "./components/ElectronLink";
import "./components/directives/InfoView";
import "./components/directives/Search";
import "./components/directives/ValueTooltip";
import "./components/directives/ContextMenu";

import App from "./App.vue";
import modV from "./application";
import store from "./ui-store";

Vue.config.ignoredElements = ["grid", "c"];
Vue.config.productionTip = false;
Vue.use(vgl);
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

async function start() {
  const loadingElement = document.getElementById("loading");

  // eslint-disable-next-line no-for-each/no-for-each
  "loading".split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style = `animation-delay: ${index * 60}ms`;
    loadingElement.appendChild(span);
  });

  modV.setup();
  await modV.ready;

  loadingElement.remove();
  window.Vue.$mount("#app");
}

start();
