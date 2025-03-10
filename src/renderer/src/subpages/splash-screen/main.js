import { createApp } from "vue";
import App from "./App.vue";

const app = (window.Vue = createApp(App));
app.mount("#app");
