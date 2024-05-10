"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const remoteMain = require("@electron/remote/main");
const os = require("node:os");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const remoteMain__namespace = /* @__PURE__ */ _interopNamespaceDefault(remoteMain);
const icon = path.join(__dirname, "../../resources/icon.png");
remoteMain__namespace.initialize();
let modVReady = false;
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegrationInWorker: true,
      nativeWindowOpen: true,
      // window.open return Window object(like in regular browsers), not BrowserWindowProxy,
      affinity: "main-window"
      // main window, and addition windows should work in one process,
    }
  });
  require("@electron/remote/main").enable(mainWindow.webContents);
  electron.ipcMain.handle("is-modv-ready", () => modVReady);
  mainWindow.setRepresentedFilename(os.homedir());
  mainWindow.setDocumentEdited(true);
  mainWindow.setTitle("Untitled");
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  electron.ipcMain.on("modv-ready", () => {
    modVReady = true;
  });
  mainWindow.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options) => {
      if (frameName === "modal") {
        event.preventDefault();
        event.newGuest = new electron.BrowserWindow({
          ...options,
          autoHideMenuBar: true,
          closable: false,
          enableLargerThanScreen: true,
          title: ""
        });
        event.newGuest.removeMenu();
      }
    }
  );
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
