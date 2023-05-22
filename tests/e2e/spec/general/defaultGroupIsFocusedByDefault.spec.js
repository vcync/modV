import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("default group is focused by default", async () => {
  const { page } = modVApp;

  await page.reload();
  await modVApp.waitUntilModVReady();

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
