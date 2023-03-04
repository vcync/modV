import { expect, test } from "@playwright/test";
// import {
//   clickMenuItemById,
//   ipcMainCallFirstListener,
//   ipcRendererCallFirstListener,
//   ipcMainInvokeHandler,
//   ipcRendererInvoke
// } from "electron-playwright-helpers";
import { modVApp } from "./pageObjectModel";
// import jimp from "jimp";

test("renders the main window", async () => {
  const { page } = modVApp;

  const title = await page.title();
  expect(title).toBe("modV");
});

test("default group is focused by default", async () => {
  const { page } = modVApp;

  const firstGroupEl = page.locator(".group").first();
  const firstGroupElId = (await firstGroupEl.getAttribute("id")).replace(
    "group-",
    ""
  );
  const focusIndicator = firstGroupEl.locator(".group__focusIndicator");

  await expect(focusIndicator).toHaveCount(1);

  const { focus } = await modVApp.evaluateUIState();
  expect(focus.id).toBe(firstGroupElId);
});

test("renderers are registered", async () => {
  const expectedRenderers = ["2d", "isf", "shader", "three"];

  const { renderers } = await modVApp.evaluateMainState();

  expect(expectedRenderers.sort()).toEqual(Object.keys(renderers).sort());
});

test("search gallery and add module to group", async () => {
  const { page } = modVApp;

  const searchInput = await page.locator("input.gallery-search");
  await searchInput.click();

  await searchInput.fill("ball");

  // Double click c:nth-child(2) > .smooth-dnd-container > div > .gallery-item > canvas >> nth=0
  await page
    .locator("c:nth-child(2) > .smooth-dnd-container > div > .gallery-item ", {
      hasText: "Ball"
    })
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
