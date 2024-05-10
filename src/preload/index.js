import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import * as remote from "@electron/remote";
const { vibrate } = require("hapticjs");


// Custom APIs for renderer
const api = {
  vibrate
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('remote', remote)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.remote = remote
  window.api = api
}
