import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

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
