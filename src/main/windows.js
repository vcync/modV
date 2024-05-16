import { BrowserWindow } from "electron";
import { is } from "@electron-toolkit/utils";
import { updateMenu } from "./menu-bar";
import { windowPrefs } from "./window-prefs";

const path = require("path");

const windows = {};

function createWindow({ windowName, options = {} }, event) {
  if (windowPrefs[windowName].unique && windows[windowName]) {
    windows[windowName].focus();
    windows[windowName].show();

    if (event) {
      event.reply("window-ready", {
        id: windows[windowName].webContents.id,
        window: windowName,
      });
    }

    return;
  }

  let windowOptions = windowPrefs[windowName].options;

  if (typeof windowPrefs[windowName].beforeCreate === "function") {
    const { options } = windowPrefs[windowName].beforeCreate();
    windowOptions = { ...windowOptions, ...options };
  }

  // Create the browser window.
  windows[windowName] = new BrowserWindow({
    ...windowOptions,
    ...options,
  });

  updateMenu(true);

  if (typeof windowPrefs[windowName].create === "function") {
    windowPrefs[windowName].create(windows[windowName]);
  }

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    // Load the url of the dev server if in development mode
    windows[windowName].loadURL(
      process.env["ELECTRON_RENDERER_URL"] + windowPrefs[windowName].devPath,
    );
    if (!process.env.IS_TEST) {
      // windows[windowName].webContents.openDevTools();
    }
  } else {
    // Load the index.html when not in development
    windows[windowName].loadFile(
      path.join(__dirname, `../renderer/${windowPrefs[windowName].prodPath}`),
    );
  }

  windows[windowName].on("closed", () => {
    if (typeof windowPrefs[windowName].destroy === "function") {
      windowPrefs[windowName].destroy();
    }

    windows[windowName] = null;
  });

  if (event) {
    windows[windowName].webContents.once("dom-ready", () => {
      event.reply("window-ready", {
        id: windows[windowName].webContents.id,
        window: windowName,
      });
    });
  }

  return windows[windowName];
}

function closeWindow({ windowName }) {
  if (windows[windowName]) {
    windows[windowName].close();
  }
}

export { windows, createWindow, closeWindow };
