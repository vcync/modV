/**
 * Example Playwright script for Electron
 * showing/testing various API features
 * in both renderer and main processes
 */

import { expect, test } from "@playwright/test";
import {
  // clickMenuItemById,
  findLatestBuild,
  // ipcMainCallFirstListener,
  // ipcRendererCallFirstListener,
  parseElectronApp
  // ipcMainInvokeHandler,
  // ipcRendererInvoke
} from "electron-playwright-helpers";
// import jimp from "jimp";
import { _electron as electron } from "playwright";

let electronApp;

test.beforeAll(async () => {
  // find the latest build in the out directory
  const latestBuild = findLatestBuild("./dist_electron/");
  // parse the directory and find paths and other info
  const appInfo = parseElectronApp(latestBuild);
  // set the CI environment variable to true
  process.env.CI = "e2e";
  electronApp = await electron.launch({
    args: [appInfo.main],
    executablePath: appInfo.executable
  });
  electronApp.on("window", async page => {
    const filename = page
      .url()
      ?.split("/")
      .pop();
    console.log(`Window opened: ${filename}`);

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

test.afterAll(async () => {
  // await electronApp.close();
});

let page;

test("renders the first page", async () => {
  page = await electronApp.firstWindow();
  await page.waitForTimeout(5000);
  await page.waitForSelector("#app");
  const title = await page.title();
  expect(title).toBe("modV");
});

test("search gallery and add module to group", async () => {
  const searchInput = await page.locator("input.gallery-search");
  await searchInput.click();

  await searchInput.fill("ball");

  // Double click c:nth-child(2) > .smooth-dnd-container > div > .gallery-item > canvas >> nth=0
  await page
    .locator(
      "c:nth-child(2) > .smooth-dnd-container > div > .gallery-item > canvas"
    )
    .first()
    .dblclick({
      position: {
        x: 98,
        y: 27
      }
    });

  await page.waitForSelector(".group__modules .active-module");
  const activeModules = await page.locator(".group__modules .active-module");
  expect(await activeModules.count()).toBe(1);

  const activeModule = await activeModules
    .first()
    .locator(".active-module__title");
  const activeModuleTitle = await activeModule.textContent();
  expect(activeModuleTitle.trim()).toBe("Ball");
});

// test("record something with codegen", async () => {
//   await page.pause();
// });

// test(`"create new window" button exists`, async () => {
//   expect(await page.$("#new-window")).toBeTruthy();
// });

// test("click the button to open new window", async () => {
//   await page.click("#new-window");
//   const newPage = await electronApp.waitForEvent("window");
//   expect(newPage).toBeTruthy();
//   page = newPage;
// });

// test("window 2 has correct title", async () => {
//   const title = await page.title();
//   expect(title).toBe("Window 2");
// });

// test("trigger IPC listener via main process", async () => {
//   electronApp.evaluate(({ ipcMain }) => {
//     ipcMain.emit("new-window");
//   });
//   const newPage = await electronApp.waitForEvent("window");
//   expect(newPage).toBeTruthy();
//   expect(await newPage.title()).toBe("Window 3");
//   page = newPage;
// });

// test("send IPC message from renderer", async () => {
//   // evaluate this script in render process
//   // requires webPreferences.nodeIntegration true and contextIsolation false
//   await page.evaluate(() => {
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     require("electron").ipcRenderer.send("new-window");
//   });
//   const newPage = await electronApp.waitForEvent("window");
//   expect(newPage).toBeTruthy();
//   expect(await newPage.title()).toBe("Window 4");
//   page = newPage;
// });

// test("receive IPC invoke/handle via renderer", async () => {
//   // evaluate this script in RENDERER process and collect the result
//   const result = await ipcRendererInvoke(page, "how-many-windows");
//   expect(result).toBe(4);
// });

// test("receive IPC handle data via main", async () => {
//   // evaluate this script in MAIN process and collect the result
//   const result = await ipcMainInvokeHandler(electronApp, "how-many-windows");
//   expect(result).toBe(4);
// });

// test("receive synchronous data via ipcRendererCallFirstListener()", async () => {
//   const data = await ipcRendererCallFirstListener(page, "get-synchronous-data");
//   expect(data).toBe("Synchronous Data");
// });

// test("receive asynchronous data via ipcRendererCallFirstListener()", async () => {
//   const data = await ipcRendererCallFirstListener(
//     page,
//     "get-asynchronous-data"
//   );
//   expect(data).toBe("Asynchronous Data");
// });

// test("receive synchronous data via ipcMainCallFirstListener()", async () => {
//   const data = await ipcMainCallFirstListener(
//     electronApp,
//     "main-synchronous-data"
//   );
//   expect(data).toBe("Main Synchronous Data");
// });

// test("receive asynchronous data via ipcMainCallFirstListener()", async () => {
//   const data = await ipcMainCallFirstListener(
//     electronApp,
//     "main-asynchronous-data"
//   );
//   expect(data).toBe("Main Asynchronous Data");
// });

// test("select a menu item via the main process", async () => {
//   await clickMenuItemById(electronApp, "new-window");
//   const newPage = await electronApp.waitForEvent("window");
//   expect(newPage).toBeTruthy();
//   expect(await newPage.title()).toBe("Window 5");
//   page = newPage;
// });

// test("make sure two screenshots of the same page match", async ({ page }) => {
//   // take a screenshot of the current page
//   const screenshot1 = await page.screenshot();
//   // create a visual hash using Jimp
//   const screenshot1hash = (await jimp.read(screenshot1)).hash();
//   // take a screenshot of the page
//   const screenshot2 = await page.screenshot();
//   // create a visual hash using Jimp
//   const screenshot2hash = (await jimp.read(screenshot2)).hash();
//   // compare the two hashes
//   expect(screenshot1hash).toEqual(screenshot2hash);
// });
