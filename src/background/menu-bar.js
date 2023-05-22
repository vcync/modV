import fs from "fs";
import path from "path";
import { dialog, shell, app, ipcMain, Menu } from "electron";
import { windows } from "./windows";
import { openFile } from "./open-file";
import { getMediaManager } from "./media-manager";
import { projectNames, setCurrentProject, currentProject } from "./projects";

const isMac = process.platform === "darwin";

let lastFileSavedPath = null;

async function writePresetToFile(filePath) {
  ipcMain.once("preset-data", async (_, presetData) => {
    try {
      await fs.promises.writeFile(filePath, presetData);
    } catch (e) {
      dialog.showMessageBox(windows["mainWindow"], {
        type: "error",
        message: "Could not save preset to file",
        detail: e.toString()
      });
    }
  });

  try {
    windows["mainWindow"].webContents.send("generate-preset");
  } catch (e) {
    dialog.showMessageBox(windows["mainWindow"], {
      type: "error",
      message: "Could not generate preset",
      detail: e.toString()
    });
  }
}

export function generateMenuTemplate() {
  const mediaManager = getMediaManager();

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
            const result = await dialog.showOpenDialog(windows["mainWindow"], {
              filters: [
                { name: "Presets", extensions: ["json"] },
                { name: "All Files", extensions: ["*"] }
              ],
              properties: ["openFile"],
              multiSelections: false
            });

            if (!result.canceled) {
              const filePath = result.filePaths[0];
              openFile(filePath);
            }
          }
        },
        ...(isMac
          ? [
              {
                label: "Open Recent",
                role: "recentdocuments",
                submenu: [
                  {
                    label: "Clear Recent",
                    role: "clearrecentdocuments"
                  }
                ]
              }
            ]
          : []),
        { type: "separator" },
        {
          label: "Save Preset",
          accelerator: "CmdOrCtrl+S",
          enabled: !!lastFileSavedPath,
          async click() {
            writePresetToFile(lastFileSavedPath);
          }
        },
        {
          label: "Save Preset As…",
          accelerator: "CmdOrCtrl+Shift+S",
          async click() {
            const result = await dialog.showSaveDialog(windows["mainWindow"], {
              defaultPath: lastFileSavedPath || "preset.json",
              filters: [{ name: "Presets", extensions: ["json"] }]
            });

            if (result.canceled) {
              return;
            }

            try {
              await writePresetToFile(result.filePath);
            } catch (e) {
              console.error(e);
            }

            lastFileSavedPath = path.resolve(result.filePath);
            updateMenu();
          }
        },

        { type: "separator" },
        {
          label: "Open Media folder",
          async click() {
            if (mediaManager.mediaDirectoryPath) {
              const failed = await shell.openPath(
                mediaManager.mediaDirectoryPath
              );

              if (failed) {
                console.error(failed);
              }
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
        {
          label: "New Output Window",
          click: () => {
            windows["mainWindow"].webContents.send("create-output-window");
          }
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forcereload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { type: "separator" },
        {
          label: "Reset layout",
          async click() {
            const { response } = await dialog.showMessageBox(
              windows["mainWindow"],
              {
                type: "question",
                buttons: ["Yes", "No"],
                message: "modV",
                detail: "Are you sure you want to reset the current layout?"
              }
            );

            if (response === 0) {
              windows["mainWindow"].webContents.send("reset-layout");
            }
          }
        }
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
          label: "Learn modV",
          click() {
            const { shell } = require("electron");
            shell.openExternal("https://modv.js.org");
          }
        },
        {
          label: "Search or ask a question",
          click() {
            const { shell } = require("electron");
            shell.openExternal("https://github.com/vcync/modV/discussions");
          }
        }
      ]
    }
  ];
}

export function updateMenu(setWindowListener) {
  if (setWindowListener) {
    windows["mainWindow"].on("ready-to-show", () => {
      lastFileSavedPath = null;
      updateMenu();
    });
  }

  const menu = Menu.buildFromTemplate(generateMenuTemplate());
  Menu.setApplicationMenu(menu);
}
