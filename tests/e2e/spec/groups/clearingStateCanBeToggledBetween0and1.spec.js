import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("clearing state can be toggled beween 0 and 1", async () => {
  const {
    groupIndex,
    groupId
  } = await modVApp.groups.getFirstUserGroupIdAndIndex();

  const { clearingCheckbox } = modVApp.groups.getLocators(groupId);

  await modVApp.groups.showControls(groupId);

  for (let i = 0; i < 2; i += 1) {
    await clearingCheckbox.click();

    await modVApp.checkWorkerAndMainState(
      state => expect(state[groupIndex].clearing).toBe(Number(!i)),
      `groups.groups`
    );
  }
});
