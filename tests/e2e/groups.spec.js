import { expect, test } from "@playwright/test";
import { modVApp } from "./pageObjectModel";
import { setRangeValue } from "./utils/setRangeValue";
import compositeOperations from "../../src/util/composite-operations";

test.describe("groups", () => {
  test.describe.configure({ mode: "parallel" });

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

  test("enabled state can be toggled between 0, 1 and 2", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { enabledCheckbox } = modVApp.groups.getLocators(groupId);

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

  test("inherit and inheritFrom state can be set", async () => {
    const userGroups = modVApp.groups.getUserGroups();
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { inheritSelect } = modVApp.groups.getLocators(groupId);

    await modVApp.groups.showControls(groupId);

    const values = [-2, -1];
    for (let i = 0; i < userGroups.length; i += 1) {
      values.push(i);
    }

    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      await inheritSelect.selectOption(String(value));

      if (value === -2) {
        await modVApp.checkWorkerAndMainState(state =>
          expect(state.groups.groups[groupIndex].inherit).toBe(false)
        );
      } else {
        await modVApp.checkWorkerAndMainState(state =>
          expect(state.groups.groups[groupIndex].inherit).toBe(true)
        );

        await modVApp.checkWorkerAndMainState(state =>
          expect(state.groups.groups[groupIndex].inheritFrom).toBe(value)
        );
      }
    }
  });

  test("clearing state can be toggled beween 0 and 1", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { clearingCheckbox } = modVApp.groups.getLocators(groupId);

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

    const { pipelineCheckbox } = modVApp.groups.getLocators(groupId);

    await modVApp.groups.showControls(groupId);

    for (let i = 0; i < 2; i += 1) {
      await pipelineCheckbox.click();

      await modVApp.checkWorkerAndMainState(state =>
        expect(state.groups.groups[groupIndex].pipeline).toBe(i === 0 ? 1 : 0)
      );
    }
  });

  test("alpha state can be set", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { alphaRange } = modVApp.groups.getLocators(groupId);

    await modVApp.groups.showControls(groupId);

    for (let i = 0; i < 5; i += 1) {
      const value = Math.random();
      await setRangeValue(alphaRange, value);

      await modVApp.checkWorkerAndMainState(state =>
        expect(state.groups.groups[groupIndex].alpha).toBeCloseTo(value)
      );
    }
  });

  test("blend mode state can be set", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { blendModeSelect } = modVApp.groups.getLocators(groupId);

    await modVApp.groups.showControls(groupId);

    const values = [
      ...compositeOperations[0].children.map(({ value }) => value),
      ...compositeOperations[1].children.map(({ value }) => value)
    ];

    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      await blendModeSelect.selectOption(String(value));

      await modVApp.checkWorkerAndMainState(state =>
        expect(state.groups.groups[groupIndex].compositeOperation).toBe(value)
      );
    }
  });

  test("group name can be changed", async () => {
    const {
      groupIndex,
      groupId
    } = await modVApp.groups.getFirstUserGroupIdAndIndex();

    const { nameDisplay, nameInput } = modVApp.groups.getLocators(groupId);

    await nameDisplay.dblclick();
    await expect(nameInput).toBeFocused();

    const newGroupName = "Post FX";

    await nameInput.type(newGroupName);
    await nameInput.press("Enter");

    await expect(nameDisplay).toHaveText(newGroupName);

    await modVApp.checkWorkerAndMainState(state =>
      expect(state.groups.groups[groupIndex].name).toBe(newGroupName)
    );
  });

  test("groups can be rearranged", async () => {
    const {
      groups: { elements, getLocators, getUserGroups, newGroupButton },
      page
    } = modVApp;

    let groups = await getUserGroups();

    if (groups.length < 2) {
      await newGroupButton.click();
      await expect(elements).toHaveCount(2);
    }

    groups = await getUserGroups();

    // https://playwright.dev/docs/input#dragging-manually
    await getLocators(groups[0].id).name.hover();
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.move(200, 200);
    await page.mouse.up();

    await modVApp.checkWorkerAndMainState(async state => {
      const userGroups = await getUserGroups(state.groups.groups);

      expect(userGroups[0].id).toBe(groups[1].id);
      expect(userGroups[1].id).toBe(groups[0].id);
    });
  });
});
