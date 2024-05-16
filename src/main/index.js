import { MessageChannelMain, app, ipcMain, net, protocol } from "electron";
import { APP_SCHEME } from "./background-constants";
import { openFile } from "./open-file";
import { createWindow } from "./windows";

require("@electron/remote/main").initialize();

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      secure: true,
      standard: true,
      stream: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);

app.on("open-file", (event, filePath) => {
  event.preventDefault();

  openFile(filePath);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  createWindow({ windowName: "mainWindow" });
});

function setupColorPickerUIMessageChannels(mainWindow, colorPickerWindow) {
  const {
    port1: colorPickerUIChannel_mainWindowPort,
    port2: colorPickerUIChannel_colorPickerPort,
  } = new MessageChannelMain();

  mainWindow.webContents.postMessage("port:colorPickerUI", null, [
    colorPickerUIChannel_mainWindowPort,
  ]);

  colorPickerWindow.webContents.postMessage("port:colorPickerUI", null, [
    colorPickerUIChannel_colorPickerPort,
  ]);

  // return {
  //   colorPickerUIChannel_mainWindowPort: port1,
  //   colorPickerUIChannel_colorPickerPort: port2,
  // };
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  protocol.handle(APP_SCHEME, (request) => {
    const newPath =
      "file://" +
      new URL("http://modv.com/" + request.url.slice(`${APP_SCHEME}://`.length))
        .pathname;

    return net.fetch(newPath);
  });

  app.commandLine.appendSwitch(
    "disable-backgrounding-occluded-windows",
    "true",
  );

  const mainWindow = createWindow({ windowName: "mainWindow" });
  ipcMain.once("main-window-created", () => {
    createWindow({ windowName: "splashScreen" });

    /////// color picker

    const {
      port1: colorPickerMainChannel_mainPort,
      port2: colorPickerMainChannel_colorPickerPort,
    } = new MessageChannelMain();

    colorPickerMainChannel_mainPort.on("message", (e) => {
      if (e.data === "create-port:colorPickerUI") {
        setupColorPickerUIMessageChannels(mainWindow, colorPickerWindow);
      }
    });

    const colorPickerWindow = createWindow({
      windowName: "colorPicker",
      options: { show: false },
    });

    colorPickerWindow.once("ready-to-show", () => {
      setupColorPickerUIMessageChannels(mainWindow, colorPickerWindow);

      colorPickerWindow.webContents.postMessage("port:colorPickerMain", null, [
        colorPickerMainChannel_colorPickerPort,
      ]);
    });
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
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
