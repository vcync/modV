import { modVApp } from ".";

export default {
  get newGroupButton() {
    return modVApp.page.locator("#new-group-button");
  },

  get elements() {
    return modVApp.page.locator(".groups .group");
  },

  getControlLocators(groupId) {
    const { page } = modVApp;

    return {
      enabledCheckbox: page.locator(
        `#group-${groupId} .group__enabledCheckbox`
      ),
      inheritSelect: page.locator(
        `#group-${groupId} .group__inheritSelect select`
      ),
      clearingCheckbox: page.locator(
        `#group-${groupId} .group__clearingCheckbox input`
      ),
      pipelineCheckbox: page.locator(
        `#group-${groupId} .group__pipelineCheckbox input`
      ),
      alphaRange: page.locator(`#group-${groupId} .group__alphaRange input`),
      blendModeSelect: page.locator(
        `#group-${groupId} .group__blendModeSelect select`
      )
    };
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
