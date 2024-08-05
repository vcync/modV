import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("group name can be changed", async () => {
  const { groupIndex, groupId } =
    await modVApp.groups.getFirstUserGroupIdAndIndex();

  const { nameDisplay, nameInput } = modVApp.groups.getLocators(groupId);

  await nameDisplay.dblclick();
  await expect(nameInput).toBeFocused();

  const newGroupName = "Post FX";

  await nameInput.fill(newGroupName);
  await nameInput.press("Enter");

  await expect(nameDisplay).toHaveText(newGroupName);

  await modVApp.checkWorkerAndMainState(
    [[(state) => state, (e) => e.toBe(newGroupName)]],
    `groups.groups[${groupIndex}].name`,
  );
});
