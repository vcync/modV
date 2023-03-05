import { modVApp } from ".";
import constants from "../../../src/application/constants";

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
      controlsButton: page.locator(`#group-${groupId} .group__controlsButton`),
      enabledCheckbox: page.locator(
        `#group-${groupId} .group__enabledCheckbox`
      ),
      inheritSelect: page.locator(
        `#group-${groupId} .group__inheritSelect select`
      ),
      clearingCheckbox: page.locator(
        `#group-${groupId} .group__clearingCheckbox`
      ),
      pipelineCheckbox: page.locator(
        `#group-${groupId} .group__pipelineCheckbox`
      ),
      alphaRange: page.locator(`#group-${groupId} .group__alphaRange input`),
      blendModeSelect: page.locator(
        `#group-${groupId} .group__blendModeSelect select`
      )
    };
  },

  async showControls(groupId) {
    const { controlsButton } = this.getControlLocators(groupId);

    const controlsHidden = await controlsButton.evaluate(el =>
      el.classList.contains("group__controlsButton-hidden")
    );

    console.log(groupId, controlsHidden);

    if (controlsHidden) {
      await controlsButton.click();
    }
  },

  async getUserGroups() {
    const { groups } = await modVApp.groups.mainState();
    return groups.filter(group => group.name !== constants.GALLERY_GROUP_NAME);
  },

  async getFirstUserGroupIdAndIndex() {
    const { groups } = await this.mainState();
    const userGroups = await this.getUserGroups();
    const groupId = userGroups[0].id;
    const groupIndex = groups.findIndex(group => group.id === groupId);

    return { groupId, groupIndex };
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
