// import {
//   clickMenuItemById,
//   ipcMainCallFirstListener,
//   ipcRendererCallFirstListener,
//   ipcMainInvokeHandler,
//   ipcRendererInvoke
// } from "electron-playwright-helpers";

// import jimp from "jimp";

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
