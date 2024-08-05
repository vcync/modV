import mkdirpTop from "mkdirp";
import path from "path";
import { promisify } from "util";
import store from "./store";

const mkdirp = promisify(mkdirpTop);

export default async function fsCreateProfile(profileName) {
  await mkdirp(path.join(this.mediaDirectoryPath, profileName));

  const promises = [
    ...store.getters["readHandlers/folders"].map(folder =>
      mkdirp(path.join(this.mediaDirectoryPath, profileName, folder))
    )
  ];

  return Promise.all(promises);

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName));
  // } catch (e) {
  //   throw new Error(`Could not make "${profileName}" profile directory ${e}`);
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "image"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile image directory ${e}`
  //   );
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "video"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile video directory ${e}`
  //   );
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "palette"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile palette directory ${e}`
  //   );
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "preset"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile preset directory ${e}`
  //   );
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "module"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile module directory ${e}`
  //   );
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "plugin"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile plugin directory ${e}`
  //   );
  // }

  // try {
  //   mkdirp.sync(path.join(this.mediaDirectoryPath, profileName, "plugin_data"));
  // } catch (e) {
  //   throw new Error(
  //     `Could not make "${profileName}" profile plug_data directory ${e}`
  //   );
  // }
}
