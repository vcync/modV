import { createApp } from "vue";
import get from "lodash.get";

import { installInputs } from "./components/inputs/index.js";
import ElectronLink from "./components/ElectronLink.vue";
import { InfoView } from "./components/directives/InfoView.js";
import { installSearch } from "./components/directives/Search.js";
import { installValueTooltip } from "./components/directives/ValueTooltip.js";
import { installContextMenu } from "./components/directives/ContextMenu.js";

import App from "./App.vue";
import modV from "./application";
import store from "./ui-store";

const { ipcRenderer } = window.electron;

window.modV = modV;

const app = (window.Vue = createApp(App));
app.use(store);

app.config.globalProperties.$modV = modV;

app.component("ElectronLink", ElectronLink);

installInputs(app);
app.use(InfoView);
installSearch(app);
installValueTooltip(app);
installContextMenu(app);

export { app };

// For Playwright
window._get = get;

async function start() {
  ipcRenderer.send("main-window-created");
  const loadingElement = document.getElementById("loading");

  "loading".split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.style = `animation-delay: ${index * 60}ms`;
    loadingElement.appendChild(span);
  });

  await modV.ready;
  modV.setup();

  loadingElement.remove();
  app.mount("#app");
}

start();
