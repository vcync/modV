require("dotenv").config();
const { notarize } = require("electron-notarize");

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (
    electronPlatformName !== "darwin" ||
    !process.env.APPLEID ||
    !process.env.APPLEIDPASS
  ) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log("Notarizing macOS application…");

  return await notarize({
    appBundleId: "gl.vcync.modv",
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  });
};
