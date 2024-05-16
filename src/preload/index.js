import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import * as remote from "@electron/remote";
const { vibrate } = require("hapticjs");

// Custom APIs for renderer
const api = {
  vibrate,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("remote", remote);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.remote = remote;
  window.api = api;
}

const { ipcRenderer } = require("electron");

ipcRenderer.on("port:colorPickerUI", (e) => {
  // mainwindow got port from main

  if (window.electronMessagePort) {
    // mainwindow closed existing port
    window.electronMessagePort.close();
  }

  // port received, make it globally available.
  window.electronMessagePort = e.ports[0];
});
