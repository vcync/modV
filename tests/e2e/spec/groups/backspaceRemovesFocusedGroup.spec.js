import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("backspace removes focused group", async () => {
  const { page } = modVApp;

  const {
    groups: { length: groupsLength }
  } = await modVApp.groups.mainState();

  const userGroups = await modVApp.groups.getUserGroups();
  let groupId = userGroups[groupsLength - 2].id;

  await modVApp.groups.focusGroup(groupId);
  await page.keyboard.press("Backspace");

  await expect(modVApp.groups.elements).toHaveCount(groupsLength - 2);

  await modVApp.checkWorkerAndMainState(state => {
    expect(state.groups.groups.length).toBe(groupsLength - 1);
    expect(state.groups.groups.findIndex(group => group.id === groupId)).toBe(
      -1
    );
  });

  // Add a group back just in case this test shares the same worker as another
  await modVApp.groups.newGroupButton.click();
  ({ groupId } = await modVApp.groups.getFirstUserGroupIdAndIndex());
  const { enabledCheckbox } = modVApp.groups.getLocators(groupId);
  await enabledCheckbox.click();
});
