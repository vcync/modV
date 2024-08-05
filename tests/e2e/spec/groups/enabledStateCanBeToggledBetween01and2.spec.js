import { test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("enabled state can be toggled between 0, 1 and 2", async () => {
  const { groupIndex, groupId } =
    await modVApp.groups.getFirstUserGroupIdAndIndex();

  const { enabledCheckbox } = modVApp.groups.getLocators(groupId);

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    [[(state) => state[groupIndex].enabled, (e) => e.toBe(0)]],
    `groups.groups`,
  );

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    [[(state) => state, (e) => e.toBe(1)]],
    `groups.groups[${groupIndex}].enabled`,
  );

  await modVApp.page.keyboard.down("Alt");
  await enabledCheckbox.click();
  await modVApp.page.keyboard.up("Alt");

  await modVApp.checkWorkerAndMainState(
    [[(state) => state[groupIndex].enabled, (e) => e.toBe(2)]],
    `groups.groups`,
  );

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    [[(state) => state[groupIndex].enabled, (e) => e.toBe(0)]],
    `groups.groups`,
  );

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    [[(state) => state[groupIndex].enabled, (e) => e.toBe(1)]],
    `groups.groups`,
  );
});
