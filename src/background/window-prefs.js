import { app, dialog, ipcMain, screen, BrowserWindow } from "electron";

import store from "../media-manager/store";
import { autoUpdater } from "electron-updater";
import { checkMediaPermission } from "./check-media-permission";
import { setProjectNames, setCurrentProject } from "./projects";
import { closeWindow, createWindow, windows } from "./windows";
import { updateMenu } from "./menu-bar";
import { getMediaManager } from "./media-manager";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.CI === "e2e";
let shouldCloseMainWindowAndQuit = false;
let modVReady = false;

const windowPrefs = {
  colorPicker: {
    devPath: "colorPicker",
    prodPath: "colorPicker.html",
    options: {
      webPreferences: {
        contextIsolation: false,
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      },
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      fullscreenable: false
    },
    unique: true,
    create(window) {
      window.on("close", e => {
        e.preventDefault();

        window.hide();
      });

      window.on("blur", () => {
        window.hide();
      });
    }
  },

  mainWindow: {
    devPath: "",
    prodPath: "index.html",
    options: {
      show: isDevelopment,
      webPreferences: {
        enableRemoteModule: true,
        // electron 12 sets contextIsolation to true by default, this breaks modV
        contextIsolation: false,
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        nodeIntegrationInWorker: true,
        nativeWindowOpen: true, // window.open return Window object(like in regular browsers), not BrowserWindowProxy
        affinity: "main-window" // main window, and addition windows should work in one process,
      }
    },
    unique: true,

    beforeCreate() {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;

      modVReady = false;

      return {
        options: {
          width,
          height
        }
      };
    },

    async create(window) {
      require("@electron/remote/main").enable(window.webContents);

      ipcMain.handle("is-modv-ready", () => modVReady);

      // Configure child windows to open without a menubar (windows/linux)
      window.webContents.on(
        "new-window",
        (event, url, frameName, disposition, options) => {
          if (frameName === "modal") {
            event.preventDefault();
            event.newGuest = new BrowserWindow({
              ...options,
              autoHideMenuBar: true
            });

            event.newGuest.removeMenu();
          }
        }
      );

      const mm = getMediaManager();

      mm.update = message => {
        window.webContents.send("media-manager-update", message);

        setProjectNames(mm.$store.getters["media/projects"]);
        updateMenu();
      };

      mm.pathChanged = message => {
        window.webContents.send("media-manager-path-changed", message);
      };

      ipcMain.on("open-window", (event, message) => {
        createWindow({ windowName: message }, event);
      });

      ipcMain.on("close-window", (event, message) => {
        closeWindow({ windowName: message });
      });

      ipcMain.on("modv-ready", () => {
        modVReady = true;
        mm.start();
      });

      ipcMain.on("modv-destroy", () => {
        mm.reset();
      });

      ipcMain.on("get-media-manager-state", event => {
        event.reply("media-manager-state", store.state.media);
      });

      ipcMain.on("save-file", async (event, message) => {
        try {
          mm.saveFile(message);
        } catch (e) {
          event.reply("save-file", e);
        }

        event.reply("save-file", "saved");
      });

      ipcMain.on("current-project", (event, message) => {
        setCurrentProject(message);
        updateMenu();
      });

      ipcMain.on("input-update", (event, message) => {
        window.webContents.send("input-update", message);
      });

      if (!isDevelopment && !isTest) {
        window.on("close", async e => {
          if (shouldCloseMainWindowAndQuit) {
            app.quit();
            return;
          }

          e.preventDefault();

          const { response } = await dialog.showMessageBox(window, {
            type: "question",
            buttons: ["Yes", "No"],
            message: "modV",
            detail: "Are you sure you want to quit?"
          });

          if (response === 0) {
            shouldCloseMainWindowAndQuit = true;
            window.close();
          }
        });
      }

      // Check for updates
      autoUpdater.checkForUpdatesAndNotify();

      if (process.platform !== "linux") {
        await checkMediaPermission();
      }
    },

    destroy() {
      ipcMain.removeAllListeners("open-window");
      ipcMain.removeAllListeners("modv-ready");
      ipcMain.removeAllListeners("modv-destroy");
      ipcMain.removeAllListeners("get-media-manager-state");
      ipcMain.removeAllListeners("save-file");
      ipcMain.removeAllListeners("current-project");
      ipcMain.removeAllListeners("input-update");
    }
  },

  splashScreen: {
    devPath: "splashScreen",
    prodPath: "splashScreen.html",
    options: {
      show: !isDevelopment,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      },
      transparent: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      fullscreenable: false,
      center: true,
      movable: false,
      backgroundColor: "#00000000",
      hasShadow: false,
      width: 600,
      height: 600
    },
    unique: true,

    async create(window) {
      ipcMain.on("modv-ready", () => {
        try {
          window.close();
        } catch (e) {
          console.error(e);
        }
        windows["mainWindow"].maximize();
      });
    }
  }
};

export { windowPrefs };
