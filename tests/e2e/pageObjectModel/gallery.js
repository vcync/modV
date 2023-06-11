import { expect } from "@playwright/test";
import { modVApp } from ".";

export const gallery = {
  async addModuleToFocusedGroup(moduleName) {
    const { page } = modVApp;

    await page
      .locator(".gallery-item ", {
        has: page.locator(`text="${moduleName}"`)
      })
      .dblclick({
        // position derived from Playwright recording - might not be accurate on
        // different gallery item sizes
        position: {
          x: 98,
          y: 27
        }
      });
  },

  async addModuleToGroupByName(moduleName, groupId) {
    const { page, groups } = modVApp;

    if (!groupId) {
      const userGroups = await groups.getUserGroups();
      groupId = userGroups[0].id;
    }

    const galleryItem = await page.locator(".gallery-item ", {
      has: page.locator(`text="${moduleName}"`)
    });

    await galleryItem.scrollIntoViewIfNeeded();

    const { modules: groupModules } = groups.getLocators(groupId);

    const numberOfActiveModulesInGroup = await groupModules
      .locator(".active-module")
      .count();

    await galleryItem.hover();
    await page.mouse.down();
    await groupModules.hover();
    await groupModules.hover();
    await page.mouse.up();

    // Using expect.toHaveCount to wait for UI and subsequent state update
    await expect(groupModules).toHaveCount(numberOfActiveModulesInGroup + 1);

    const state = await modVApp.evaluateWorkerState();
    const group = state.groups.groups.find(group => group.id === groupId);

    return group.modules.pop();
  }
};
