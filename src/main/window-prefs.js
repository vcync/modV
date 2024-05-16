import { app, dialog, ipcMain, screen, BrowserWindow } from "electron";
import os from "node:os";
import { join } from "path";

import store from "./media-manager/store";
// import { autoUpdater } from "electron-updater"; @TODO add back in updater
import { checkMediaPermission } from "./check-media-permission";
import { setProjectNames, setCurrentProject } from "./projects";
import { closeWindow, createWindow, windows } from "./windows";
import { updateMenu } from "./menu-bar";
import { getMediaManager } from "./media-manager";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.CI === "e2e";
let modVReady = false;

const windowPrefs = {
  colorPicker: {
    devPath: "/color-picker.html",
    prodPath: "color-picker.html",
    options: {
      webPreferences: {
        preload: join(__dirname, "../preload/colorPicker.js"),
        contextIsolation: false,
        nodeIntegration: false,
      },
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      fullscreenable: false,
    },
    unique: true,
    create(window) {
      window.on("close", (e) => {
        e.preventDefault();

        window.hide();
      });

      window.on("blur", () => {
        window.hide();
      });
    },
  },

  mainWindow: {
    devPath: "/index.html",
    prodPath: "index.html",
    options: {
      show: isDevelopment,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        enableRemoteModule: true,
        // electron 12 sets contextIsolation to true by default, this breaks modV
        contextIsolation: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        nativeWindowOpen: true, // window.open return Window object(like in regular browsers), not BrowserWindowProxy
        affinity: "main-window", // main window, and additional windows should work in one process
      },
    },
    unique: true,

    beforeCreate() {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;

      modVReady = false;

      return {
        options: {
          width,
          height,
        },
      };
    },

    /**
     * @param {Electron.BrowserWindow} window
     */
    async create(window) {
      require("@electron/remote/main").enable(window.webContents);

      ipcMain.handle("is-modv-ready", () => modVReady);

      window.setRepresentedFilename(os.homedir());
      window.setDocumentEdited(true);
      window.setTitle("Untitled");

      window.webContents.on("did-finish-load", () => {
        window.setTitle("Untitled");
      });

      // Configure child windows to open without a menubar (windows/linux)
      window.webContents.on(
        "new-window",
        (event, url, frameName, disposition, options) => {
          if (frameName === "modal") {
            event.preventDefault();
            event.newGuest = new BrowserWindow({
              ...options,
              autoHideMenuBar: true,
              closable: false,
              enableLargerThanScreen: true,
              title: "",
            });

            event.newGuest.removeMenu();
          }
        },
      );

      const mm = getMediaManager();

      mm.update = (message) => {
        window.webContents.send("media-manager-update", message);

        setProjectNames(mm.$store.getters["media/projects"]);
        updateMenu();
      };

      mm.pathChanged = (message) => {
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

      ipcMain.on("get-media-manager-state", (event) => {
        event.reply(
          "media-manager-state",
          JSON.parse(JSON.stringify(store.state.media)),
        );
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
        window.on("close", async (e) => {
          e.preventDefault();

          const { response } = await dialog.showMessageBox(window, {
            type: "question",
            buttons: ["Yes", "No"],
            message: "modV",
            detail: "Are you sure you want to quit?",
          });

          if (response === 0) {
            // Use .exit instead of .quit to prevent close event firing again.
            // Usually .quit would be preferable, but since we only have one
            //   instance of the main window we can just exit.
            app.exit();
          }
        });
      }

      // Check for updates
      // autoUpdater.checkForUpdatesAndNotify();

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
      ipcMain.removeHandler("is-modv-ready");
    },
  },

  splashScreen: {
    devPath: "/splash-screen.html",
    prodPath: "splash-screen.html",
    options: {
      show: !isDevelopment,
      webPreferences: {
        nodeIntegration: true,
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
      height: 600,
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
    },
  },
};

export { windowPrefs };