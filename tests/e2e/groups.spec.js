import { expect, test } from "@playwright/test";
import { modVApp } from "./pageObjectModel";
import constants from "../../src/application/constants";

test.describe("groups", () => {
  test("creates a default group", async () => {
    await expect(modVApp.groups.elements).toHaveCount(1);

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups.length).toBe(2)
    );
  });

  test("new group button creates a new group", async () => {
    const { length: groupsLength } = (await modVApp.groups.mainState()).groups;

    await modVApp.groups.newGroupButton.click();

    await expect(modVApp.groups.elements).toHaveCount(groupsLength);

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups.length).toBe(groupsLength + 1)
    );
  });

  test("backspace removes focused group", async () => {
    const { page } = modVApp;

    const {
      groups,
      groups: { length: groupsLength }
    } = await modVApp.groups.mainState();

    const userGroups = groups.filter(
      group => group.name !== constants.GALLERY_GROUP_NAME
    );

    await modVApp.groups.focusGroup(userGroups[groupsLength - 2].id);
    await page.keyboard.press("Backspace");

    await expect(modVApp.groups.elements).toHaveCount(groupsLength - 2);

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups.length).toBe(groupsLength - 1)
    );
  });
});
