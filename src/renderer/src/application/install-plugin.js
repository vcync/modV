import store from "./worker/store";
import uiStore from "../ui-store";
import { app } from "../main";

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) {
      return "";
    } // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export default function installPlugin(plugin) {
  if (!("name" in plugin)) {
    throw new Error("Plugin requires a name");
  }

  store.dispatch("plugins/add", plugin);

  if ("store" in plugin) {
    const storeName = plugin.storeName || camelize(plugin.name);
    store.registerModule(storeName, plugin.store);
  }

  if ("uiStore" in plugin) {
    const uiStoreName = plugin.uiStoreName || camelize(plugin.name);
    uiStore.registerModule(uiStoreName, plugin.uiStore);
  }

  if ("galleryTabComponent" in plugin) {
    app.component(plugin.galleryTabComponent.name, plugin.galleryTabComponent);
  }

  if ("controlPanelComponent" in plugin) {
    app.component(
      plugin.controlPanelComponent.name,
      plugin.controlPanelComponent,
    );
  }

  if ("install" in plugin) {
    plugin.install(app, store, uiStore);
  }
}
