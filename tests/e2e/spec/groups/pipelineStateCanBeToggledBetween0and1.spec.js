import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("pipeline state can be toggled beween 0 and 1", async () => {
  const {
    groupIndex,
    groupId
  } = await modVApp.groups.getFirstUserGroupIdAndIndex();

  const { pipelineCheckbox } = modVApp.groups.getLocators(groupId);

  await modVApp.groups.showControls(groupId);

  for (let i = 0; i < 2; i += 1) {
    await pipelineCheckbox.click();

    await modVApp.checkWorkerAndMainState(
      state => expect(state[groupIndex].pipeline).toBe(i === 0 ? 1 : 0),
      `groups.groups`
    );
  }
});
