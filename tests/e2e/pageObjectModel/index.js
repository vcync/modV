import path from "path";
import { test } from "@playwright/test";
import {
  findLatestBuild,
  ipcRendererInvoke,
  parseElectronApp
} from "electron-playwright-helpers";
import { _electron as electron } from "playwright";
import { groups } from "./groups";
import { gallery } from "./gallery";
import { modules } from "./modules";
import { tabs } from "./tabs";

class ModVApp {
  groups = groups;
  gallery = gallery;
  modules = modules;
  tabs = tabs;

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor() {
    this.electronApp = null;
    this.page = null;

    test.beforeAll(async () => {
      // find the latest build in the out directory
      const latestBuild = findLatestBuild(path.resolve("./dist_electron"));
      // parse the directory and find paths and other info
      const appInfo = parseElectronApp(latestBuild);
      // set the CI environment variable to true
      process.env.CI = "e2e";

      this.electronApp = await electron.launch({
        args: [
          appInfo.main
          // "--use-fake-device-for-media-stream",
          // "--use-fake-ui-for-media-stream"
        ],
        executablePath: appInfo.executable
      });

      this.electronApp.on("window", async page => {
        // capture errors
        page.on("pageerror", error => {
          console.error(error);
        });

        // capture console messages
        page.on("console", msg => {
          console.log(msg.text());
        });
      });

      // console.info("  ℹ    Waiting for modV to become ready…");
      this.page = await modVApp.electronApp.firstWindow();
      await this.waitUntilModVReady();
    });
  }

  async waitUntilModVReady(resolver) {
    if (!resolver) {
      const promise = new Promise(async resolve => {
        resolver = resolve;

        this.waitUntilModVReady(resolver);
      });

      return promise;
    }

    const isReady = await ipcRendererInvoke(this.page, "is-modv-ready");

    if (!isReady) {
      setTimeout(() => {
        this.waitUntilModVReady(resolver);
      }, 500);

      return;
    }

    resolver();
  }

  async evaluateMainState() {
    const { page } = this;

    return page.evaluate(() => window.modV.store.state);
  }

  async evaluateUIState() {
    const { page } = this;

    return page.evaluate(() => window.Vue.$store.state);
  }

  async evaluateWorkerState() {
    const { page } = this;
    const worker = page.workers()[0];

    return worker.evaluate(() => self.store.state);
  }

  async checkWorkerAndMainState(func) {
    const workerState = await this.evaluateWorkerState();
    const mainState = await this.evaluateMainState();

    const entries = Object.entries({ workerState, mainState });

    for (let i = 0; i < entries.length; i += 1) {
      const e = entries[i];
      await func(...e.reverse());
    }
  }

  async generatePreset() {
    const { page } = this;

    return page.evaluate(async () => await window.modV.generatePreset());
  }
}

const modVApp = new ModVApp();
export { modVApp };
