import path from "path";
import { test } from "@playwright/test";
import {
  findLatestBuild,
  ipcRendererInvoke,
  parseElectronApp
} from "electron-playwright-helpers";
import { _electron as electron } from "playwright";

class ModVApp {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor() {
    this.electronApp;

    test.beforeAll(async () => {
      // find the latest build in the out directory
      const latestBuild = findLatestBuild(path.resolve("./dist_electron"));
      // parse the directory and find paths and other info
      const appInfo = parseElectronApp(latestBuild);
      // set the CI environment variable to true
      process.env.CI = "e2e";

      this.electronApp = await electron.launch({
        args: [appInfo.main],
        executablePath: appInfo.executable
      });

      this.electronApp.on("window", async page => {
        // const filename = page
        //   .url()
        //   ?.split("/")
        //   .pop();
        // console.log(`Window opened: ${filename}`);

        // capture errors
        page.on("pageerror", error => {
          console.error(error);
        });
        // capture console messages
        page.on("console", msg => {
          console.log(msg.text());
        });
      });

      console.info("  ℹ    Waiting for modV to become ready…");
      this.page = await modVApp.electronApp.firstWindow();
      await this.waitUntilModVReady();
    });

    test.afterAll(() => {
      // Playwright, why are you so bad at timings?
      setTimeout(async () => await this.electronApp.close(), 3000);
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

  get newGroupButton() {
    return this.page.locator("#new-group-button");
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

    [workerState, mainState].forEach(func);
  }

  async generatePreset() {
    const { page } = this;

    return page.evaluate(async () => await window.modV.generatePreset());
  }
}

const modVApp = new ModVApp();
export { modVApp };
