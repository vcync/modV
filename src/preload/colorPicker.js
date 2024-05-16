import { ipcRenderer } from "electron";

let mainPort = null;

ipcRenderer.on("port:colorPickerMain", (e) => {
  mainPort = e.ports[0];

  mainPort.postMessage("create-port:colorPickerUI");
});

ipcRenderer.on("port:colorPickerUI", (e) => {
  // colorPicker got port from main

  if (window.electronMessagePort) {
    // colorpicker closed existing port
    window.electronMessagePort.close();
  }

  // port received, make it globally available.
  window.electronMessagePort = e.ports[0];

  // Tell the renderer window we have the port, so it can attach listeners, etc.
  window.postMessage("port:colorPickerUI", null);
});
