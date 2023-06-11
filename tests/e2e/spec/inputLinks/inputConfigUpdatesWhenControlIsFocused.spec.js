import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("input config updates when control is focused", async () => {
  const moduleId = await modVApp.gallery.addModuleToGroupByName("Ball");

  const { name } = modVApp.modules.getLocators(moduleId);
  await name.waitFor("visible");
  await name.click();

  const inspector = modVApp.page.locator(`#module-inspector-${moduleId}`);
  await expect(inspector.locator(".module-inspector__title")).toHaveText(
    "Ball"
  );

  const { inputConfig } = modVApp.tabs.getLocators();
  await inputConfig.click();

  const inputIds = await modVApp.modules.getInputIds(moduleId);

  const amountControl = modVApp.page.locator(
    `#module-control-${inputIds.props.amount}`
  );
  await amountControl.click();

  await expect(modVApp.page.locator(".input-config__title")).toHaveText(
    "Ball: Amount"
  );
});
