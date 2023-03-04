import { modVApp } from ".";

export default {
  get newGroupButton() {
    return modVApp.page.locator("#new-group-button");
  },

  get elements() {
    return modVApp.page.locator(".groups .group");
  },

  async focusGroup(groupId) {
    const { page } = modVApp;
    await page.click(`#group-${groupId} .group__title`);
  },

  async mainState() {
    const mainState = await modVApp.evaluateMainState();
    return mainState.groups;
  },

  async workerState() {
    const workerState = await modVApp.evaluateWorkerState();
    return workerState.groups;
  }
};
