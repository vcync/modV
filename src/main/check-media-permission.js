import { dialog, systemPreferences } from "electron";

/**
 * Asks for media permission on macOS.
 * @returns {Promise<boolean>} - True if access is granted, false otherwise.
 */
async function getMediaPermissionMacOS() {
  const microphoneAccess =
    await systemPreferences.askForMediaAccess("microphone");
  const cameraAccess = await systemPreferences.askForMediaAccess("camera");
  return microphoneAccess && cameraAccess;
}

/**
 * Checks media permissions on all platforms and shows a dialog if access is denied.
 */
export async function checkMediaPermission() {
  const { platform } = process;
  let hasPermission = false;

  if (platform === "darwin") {
    const microphoneStatus =
      systemPreferences.getMediaAccessStatus("microphone");
    const cameraStatus = systemPreferences.getMediaAccessStatus("camera");

    if (microphoneStatus === "granted" && cameraStatus === "granted") {
      hasPermission = true;
    } else if (
      microphoneStatus === "not-determined" ||
      cameraStatus === "not-determined"
    ) {
      hasPermission = await getMediaPermissionMacOS();
    }
  } else {
    // For Windows and Linux, we can't check permissions beforehand.
    // The browser will prompt the user when media is requested.
    // We can assume permission will be granted, and handle failures later.
    hasPermission = true;
  }

  if (!hasPermission) {
    dialog.showMessageBox({
      type: "warning",
      message: "modV requires access to your camera and microphone.",
      detail:
        "To enable media features, please grant access in your system's security settings. modV can still be used without these permissions, but some functionality will be limited.",
    });
  }
}
