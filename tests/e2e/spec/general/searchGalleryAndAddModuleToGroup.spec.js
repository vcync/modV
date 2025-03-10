import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("search gallery and add module to group", async () => {
  const { page } = modVApp;

  const searchInput = await page.locator("input.gallery-search");
  await searchInput.click();

  await searchInput.fill("ball");

  // Double click c:nth-child(2) > .smooth-dnd-container > div > .gallery-item > canvas >> nth=0
  await page
    .locator("c:nth-child(2) > .smooth-dnd-container > div > .gallery-item ", {
      hasText: "Ball",
    })
    .first()
    .dblclick({
      position: {
        x: 98,
        y: 27,
      },
    });

  await page.waitForSelector(".group__modules .active-module");
  const activeModules = await page.locator(".group__modules .active-module");
  expect(await activeModules.count()).toBe(1);

  const activeModule = await activeModules
    .first()
    .locator(".active-module__name");
  const activeModuleTitle = await activeModule.textContent();
  expect(activeModuleTitle.trim()).toBe("Ball");
});
