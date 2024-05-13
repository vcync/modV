import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("renders the main window", async () => {
  const { page } = modVApp;

  await page.locator("input.gallery-search");

  const title = await page.title();
  expect(title).toBe("Untitled");
});
