import { expect, test } from "@playwright/test";
import { modVApp } from "../../pageObjectModel";

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

  await modVApp.checkWorkerAndMainState(
    [
      [
        async state => (await getUserGroups(state))[0].id,
        e => e.toBe(groups[1].id)
      ],
      [
        async state => (await getUserGroups(state))[1].id,
        e => e.toBe(groups[0].id)
      ]
    ],
    `groups.groups`
  );
});
