import {
  app,
  dialog,
  ipcMain,
  protocol,
  screen,
  BrowserWindow,
  Menu
} from "electron";

import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";

import fs from "fs";
import MediaManager from "./media-manager";
import store from "./media-manager/store";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

let projectNames = ["default"];
let currentProject = "default";

// Should the application promt when attempting to quit?
app.showExitPrompt = true;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      secure: true,
      standard: true
    }
  }
]);

const isMac = process.platform === "darwin";

function setCurrentProject(name) {
  win.webContents.send("set-current-project", name);
}

function generateMenuTemplate() {
  return [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideothers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ]
          }
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: "File",
      submenu: [
        {
          label: "Open Preset",
          accelerator: "CmdOrCtrl+O",
          async click() {
            const result = await dialog.showOpenDialog(win, {
              filters: [{ name: "Presets", extensions: ["json"] }],
              properties: ["openFile"],
              multiSelections: false
            });

            if (!result.canceled) {
              win.webContents.send("open-preset", result.filePaths[0]);
            }
          }
        },
        {
          label: "Save Preset",
          accelerator: "CmdOrCtrl+Shift+S",
          async click() {
            const result = await dialog.showSaveDialog(win, {
              filters: [{ name: "Presets", extensions: ["json"] }]
            });

            if (result.canceled) {
              return;
            }

            ipcMain.once("preset-data", async (event, presetData) => {
              try {
                await fs.promises.writeFile(result.filePath, presetData);
              } catch (e) {
                dialog.showMessageBox(win, {
                  type: "error",
                  message: "Could not save preset to file",
                  detail: e.toString()
                });
              }
            });

            try {
              win.webContents.send("generate-preset");
            } catch (e) {
              dialog.showMessageBox(win, {
                type: "error",
                message: "Could not generate preset",
                detail: e.toString()
              });
            }
          }
        },

        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" }
      ]
    },
    // { role: 'editMenu' }
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: "Speech",
                submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
              }
            ]
          : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }])
      ]
    },
    // { role: 'projectMenu' }
    {
      label: "Project",
      submenu: [
        ...projectNames.map(name => ({
          label: name,
          type: "checkbox",
          checked: currentProject === name,
          click: () => setCurrentProject(name)
        }))
      ]
    },
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              { role: "window" }
            ]
          : [{ role: "close" }])
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://modv.js.org");
          }
        }
      ]
    }
  ];
}

function updateMenu() {
  const menu = Menu.buildFromTemplate(generateMenuTemplate());
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  updateMenu();

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      nativeWindowOpen: true, // window.open return Window object(like in regular browsers), not BrowserWindowProxy
      affinity: "main-window" // main window, and addition windows should work in one process,
    }
  });

  const mm = new MediaManager({
    update(message) {
      win.webContents.send("media-manager-update", message);

      projectNames = mm.$store.getters["media/projects"];
      updateMenu(); // potentially janky
    }
  });
  mm.start();

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
    currentProject = message;
    updateMenu();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  if (!isDevelopment || process.env.IS_TEST) {
    win.on("close", async e => {
      if (app.showExitPrompt) {
        e.preventDefault(); // Prevents the window from closing
        const { response } = await dialog.showMessageBox({
          type: "question",
          buttons: ["Yes", "No"],
          message: "modV",
          detail: "Are you sure you want to quit?"
        });

        if (!response) {
          app.showExitPrompt = false;
          app.quit();
        }
      }
    });
  }

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  app.commandLine.appendSwitch(
    "disable-backgrounding-occluded-windows",
    "true"
  );

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
