import { app, protocol } from "electron";
import { APP_SCHEME } from "./background-constants";
import { getMediaManager } from "./media-manager";
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
      standard: true
    }
  }
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
  createWindow("mainWindow");
});

// https://stackoverflow.com/a/66673831
function fileHandler(req, callback) {
  const { mediaDirectoryPath } = getMediaManager();
  const requestedPath = req.url.substr(7);
  // Write some code to resolve path, calculate absolute path etc
  const check = requestedPath.indexOf(mediaDirectoryPath) > -1;

  if (!check) {
    callback({
      // -6 is FILE_NOT_FOUND
      // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
      error: -6
    });
    return;
  }

  callback({
    path: requestedPath
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  protocol.registerFileProtocol("modv", fileHandler);

  app.commandLine.appendSwitch(
    "disable-backgrounding-occluded-windows",
    "true"
  );

  createWindow("mainWindow");
  createWindow("splashScreen");
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
