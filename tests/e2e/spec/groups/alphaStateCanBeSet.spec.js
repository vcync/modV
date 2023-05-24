import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";
import { setRangeValue } from "../../utils/setRangeValue";

test("alpha state can be set", async () => {
  test.setTimeout(60 * 1000);

  const {
    groupIndex,
    groupId
  } = await modVApp.groups.getFirstUserGroupIdAndIndex();

  const { alphaRange } = modVApp.groups.getLocators(groupId);

  await modVApp.groups.showControls(groupId);

  for (let i = 0; i < 5; i += 1) {
    const value = Math.random();
    await setRangeValue(alphaRange, value);

    await modVApp.checkWorkerAndMainState(
      state => expect(state).toBeCloseTo(value),
      `groups.groups[${groupIndex}].alpha`
    );
  }
});
