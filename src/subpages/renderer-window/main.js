import Vue from "vue";
import App from "./App.vue";
import ModV from "./application";

const modV = new ModV();
window.modV = modV;

window.Vue = new Vue({
  render: h => h(App)
}).$mount("#app");
