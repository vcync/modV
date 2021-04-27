import Vue from "vue";
import vgl from "vue-golden-layout";
import Fragment from "vue-fragment";
import "./components/inputs";
import ElectronLink from "./components/ElectronLink";
import "./components/directives/InfoView";
import "./components/directives/Search";
import "./components/directives/ValueTooltip";
import storeConnector from "./store-connector";

import App from "./App.vue";
import store from "./ui-store";

Vue.config.ignoredElements = ["grid", "c"];
Vue.config.productionTip = false;
Vue.use(vgl);
Vue.use(Fragment.Plugin);
Vue.component("ElectronLink", ElectronLink);

Object.defineProperty(Vue.prototype, "$modV", {
  get() {
    return storeConnector;
  }
});

window.Vue = new Vue({
  render: h => h(App),
  store
}).$mount("#app");
