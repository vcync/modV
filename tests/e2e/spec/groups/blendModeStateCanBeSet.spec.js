import { test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";
import compositeOperations from "../../../../src/util/composite-operations";

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

    await modVApp.checkWorkerAndMainState(
      [[state => state, e => e.toBe(value)]],
      `groups.groups[${groupIndex}].compositeOperation`
    );
  }
});
