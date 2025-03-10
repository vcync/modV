import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("renders the main window", async () => {
  const { page, tabs } = modVApp;

  await expect(tabs.getLocators().inputConfig).toBeVisible();

  await expect(page).toHaveTitle("Untitled");
});
