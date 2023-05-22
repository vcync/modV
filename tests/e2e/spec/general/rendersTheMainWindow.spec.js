import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("renders the main window", async () => {
  const { page } = modVApp;

  const title = await page.title();
  expect(title).toBe("modV");
});
