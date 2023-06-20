import path from "path";

export const conformFilePath = (filePath = "") =>
  filePath
    .split(process.platform === "win32" ? path.posix.sep : path.win32.sep)
    .join(path.sep);
