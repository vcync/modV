import { expect, test } from "@playwright/test";
import { modVApp } from "./pageObjectModel";

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
      groups: { length: groupsLength }
    } = await modVApp.groups.mainState();

    const userGroups = await modVApp.groups.getUserGroups();
    const groupId = userGroups[groupsLength - 2].id;

    await modVApp.groups.focusGroup(groupId);
    await page.keyboard.press("Backspace");

    await expect(modVApp.groups.elements).toHaveCount(groupsLength - 2);

    await modVApp.checkWorkerAndMainState(state => {
      expect(state.groups.groups.length).toBe(groupsLength - 1);
      expect(state.groups.groups.findIndex(group => group.id === groupId)).toBe(
        -1
      );
    });
  });

  test("enabled state can be toggled between 0, 1 and 2", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { enabledCheckbox } = modVApp.groups.getControlLocators(groupId);

    await enabledCheckbox.click();

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups[groupIndex].enabled).toBe(0)
    );

    await enabledCheckbox.click();

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups[groupIndex].enabled).toBe(1)
    );

    await modVApp.page.keyboard.down("Alt");
    await enabledCheckbox.click();
    await modVApp.page.keyboard.up("Alt");

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups[groupIndex].enabled).toBe(2)
    );

    await enabledCheckbox.click();

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups[groupIndex].enabled).toBe(0)
    );

    await enabledCheckbox.click();

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups[groupIndex].enabled).toBe(1)
    );
  });

  test("clearing state can be toggled beween 0 and 1", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { clearingCheckbox } = modVApp.groups.getControlLocators(groupId);

    await modVApp.groups.showControls(groupId);

    for (let i = 0; i < 2; i += 1) {
      await clearingCheckbox.click();

      await modVApp.checkWorkerAndMainState(state =>
        expect(state.groups.groups[groupIndex].clearing).toBe(i === 0 ? 1 : 0)
      );
    }
  });

  test("pipeline state can be toggled beween 0 and 1", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { pipelineCheckbox } = modVApp.groups.getControlLocators(groupId);

    await modVApp.groups.showControls(groupId);

    for (let i = 0; i < 2; i += 1) {
      await pipelineCheckbox.click();

      await modVApp.checkWorkerAndMainState(state =>
        expect(state.groups.groups[groupIndex].pipeline).toBe(i === 0 ? 1 : 0)
      );
    }
  });
});
