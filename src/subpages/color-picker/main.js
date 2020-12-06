import Vue from "vue";

import App from "./App.vue";

window.Vue = new Vue({
  render: h => h(App)
}).$mount("#app");
