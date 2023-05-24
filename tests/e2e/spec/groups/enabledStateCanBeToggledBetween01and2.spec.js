import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("enabled state can be toggled between 0, 1 and 2", async () => {
  const {
    groupIndex,
    groupId
  } = await modVApp.groups.getFirstUserGroupIdAndIndex();

  const { enabledCheckbox } = modVApp.groups.getLocators(groupId);

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    state => expect(state[groupIndex].enabled).toBe(0),
    `groups.groups`
  );

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    state => expect(state).toBe(1),
    `groups.groups[${groupIndex}].enabled`
  );

  await modVApp.page.keyboard.down("Alt");
  await enabledCheckbox.click();
  await modVApp.page.keyboard.up("Alt");

  await modVApp.checkWorkerAndMainState(
    state => expect(state[groupIndex].enabled).toBe(2),
    `groups.groups`
  );

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    state => expect(state[groupIndex].enabled).toBe(0),
    `groups.groups`
  );

  await enabledCheckbox.click();

  await modVApp.checkWorkerAndMainState(
    state => expect(state[groupIndex].enabled).toBe(1),
    `groups.groups`
  );
});
