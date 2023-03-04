import path from "path";
import { expect, test } from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";
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
    });

    test.afterAll(() => {
      // Playwright, why are you so bad at timings?

      setTimeout(async () => {
        await this.electronApp.close();
      }, 3000);
    });
  }

  get page() {
    return modVApp.electronApp.firstWindow();
  }

  async getStarted() {
    await this.getStartedLink.first().click();
    await expect(this.gettingStartedHeader).toBeVisible();
  }

  async pageObjectModel() {
    await this.getStarted();
    await this.pomLink.click();
  }

  async evaluateState() {
    const page = await this.page;

    return page.evaluate(() => {
      return window.modV.store.state;
    });
  }

  async evaluateUIState() {
    const page = await this.page;

    return page.evaluate(() => {
      return window.Vue.$store.state;
    });
  }
}

const modVApp = new ModVApp();
export { modVApp };
