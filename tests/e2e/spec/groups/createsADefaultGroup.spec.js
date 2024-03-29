import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

test("creates a default group", async () => {
  await expect(modVApp.groups.elements).toHaveCount(1);

  await modVApp.checkWorkerAndMainState(
    [[state => state.length, e => e.toBe(2)]],
    `groups.groups`
  );
});
