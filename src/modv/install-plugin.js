import store from "@/store";
import Vue from "vue";

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

export default function installPlugin(plugin) {
  if (!("name" in plugin)) {
    throw new Error("Plugin requires a name");
  }

  const storeName = plugin.storeName || camelize(plugin.name);

  store.commit("plugins/addPlugin", {
    plugin
  });

  if ("store" in plugin) {
    store.registerModule(storeName, plugin.store);
  }

  if ("galleryTabComponent" in plugin) {
    Vue.component(plugin.galleryTabComponent.name, plugin.galleryTabComponent);
  }

  if ("controlPanelComponent" in plugin) {
    Vue.component(
      plugin.controlPanelComponent.name,
      plugin.controlPanelComponent
    );
  }

  if ("install" in plugin) {
    plugin.install(Vue);
  }
}
