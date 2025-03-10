import { test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("inherit and inheritFrom state can be set", async () => {
  const userGroups = modVApp.groups.getUserGroups();
  const { groupIndex, groupId } =
    await modVApp.groups.getFirstUserGroupIdAndIndex();

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
      await modVApp.checkWorkerAndMainState(
        [[(state) => state[groupIndex].inherit, (e) => e.toBe(false)]],
        `groups.groups`,
      );
    } else {
      await modVApp.checkWorkerAndMainState(
        [[(state) => state[groupIndex].inherit, (e) => e.toBe(true)]],
        `groups.groups`,
      );

      await modVApp.checkWorkerAndMainState(
        [[(state) => state[groupIndex].inheritFrom, (e) => e.toBe(value)]],
        `groups.groups`,
      );
    }
  }
});
