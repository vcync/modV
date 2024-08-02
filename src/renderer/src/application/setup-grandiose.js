import store from "./worker/store/index";
let grandiose = require("grandiose");

// let grandiose = undefined;
let sender = undefined;

export async function setupGrandiose() {
  if (grandiose === undefined) {
    /* eslint-disable */
    // __dirname = `${__dirname}/node_modules/grandiose`;
    // __dirname = __dirname.replace("app.asar", "app.asar.unpacked");
    /* eslint-enable */

    try {
      grandiose = require("grandiose");
    } catch (error) {
      if (error.message.includes("libndi.so")) {
        store.dispatch("errors/createMessage", {
          message:
            "libndi is not installed, please see \"Ubuntu/Debian\" in the modV <ElectronLink to='https://github.com/vcync/modV#ubuntudebian'>README</ElectronLink>.",
        });
      } else {
        console.error(error);
      }
    }

    // eslint-disable-next-line
    // __dirname = __dirname.replace("/node_modules/grandiose", "");
  }

  // Make sure to set grandiose to undefined as it will be an empty object otherwise
  if (!grandiose.isSupportedCPU()) {
    grandiose = undefined;
  }

  return grandiose;
}

export async function getGrandioseSender() {
  if (grandiose === undefined) {
    await setupGrandiose();
  }

  if (!sender) {
    sender = await grandiose.send({
      name: `modV (${Date.now()})`,
      clockVideo: false,
      clockAudio: false,
    });
  }

  return sender;
}
