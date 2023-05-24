import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("new group button creates a new group", async () => {
  const { length: groupsLength } = (await modVApp.groups.mainState()).groups;

  await modVApp.groups.newGroupButton.click();

  await expect(modVApp.groups.elements).toHaveCount(groupsLength);

  await modVApp.checkWorkerAndMainState(
    state => expect(state.length).toBe(groupsLength + 1),
    `groups.groups`
  );
});
