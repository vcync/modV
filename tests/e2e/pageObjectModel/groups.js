import { modVApp } from ".";
import constants from "../../../src/application/constants";

const id = (strings, groupId) => [`#group-${groupId}`, ...strings].join("");

export default {
  get newGroupButton() {
    return modVApp.page.locator("#new-group-button");
  },

  get elements() {
    return modVApp.page.locator(".groups .group");
  },

  getLocators(groupId) {
    const { page } = modVApp;

    const nameLocator = page.locator(id`${groupId} .group__name`);

    return {
      controlsButton: page.locator(id`${groupId} .group__controlsButton`),
      enabledCheckbox: page.locator(id`${groupId} .group__enabledCheckbox`),
      inheritSelect: page.locator(id`${groupId} .group__inheritSelect select`),
      clearingCheckbox: page.locator(id`${groupId} .group__clearingCheckbox`),
      pipelineCheckbox: page.locator(id`${groupId} .group__pipelineCheckbox`),
      alphaRange: page.locator(
        id`${groupId} .group__alphaRange input[type=range]`
      ),
      blendModeSelect: page.locator(
        id`${groupId} .group__blendModeSelect select`
      ),
      name: nameLocator,
      nameDisplay: nameLocator.locator("span"),
      nameInput: nameLocator.locator("input[type=text]")
    };
  },

  async showControls(groupId) {
    const { controlsButton } = this.getLocators(groupId);

    const controlsHidden = await controlsButton.evaluate(el =>
      el.classList.contains("group__controlsButton-hidden")
    );

    if (controlsHidden) {
      await controlsButton.click();
    }
  },

  async getUserGroups(groups) {
    if (!groups) {
      ({ groups } = await modVApp.groups.mainState());
    }

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
    await this.getLocators(groupId).name.click();
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
