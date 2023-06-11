import { modVApp } from ".";

const id = (strings, moduleId) =>
  [`#active-module-${moduleId}`, ...strings].join("");

export const modules = {
  async mainState() {
    const mainState = await modVApp.evaluateMainState();
    return mainState.modules;
  },

  async workerState() {
    const workerState = await modVApp.evaluateWorkerState();
    return workerState.modules;
  },

  getLocators(moduleId) {
    const { page } = modVApp;

    return {
      activeModule: page.locator(id`${moduleId}`),
      name: page.locator(id`${moduleId} .active-module__name`),
      alphaRange: page.locator(id`${moduleId} .active-module__alphaRange`),
      enabledCheckbox: page.locator(
        id`${moduleId} .active-module__enabledCheckbox`
      ),
      blendModeSelect: page.locator(
        id`${moduleId} .active-module__blendModeSelect`
      )
    };
  },

  async getInputIds(moduleId) {
    const modulesState = await this.workerState();

    const { $props, meta } = modulesState.active[moduleId];

    const { alphaInputId, enabledInputId, compositeOperationInputId } = meta;

    const inputIds = {
      meta: {
        alphaInputId,
        enabledInputId,
        compositeOperationInputId
      }
    };

    inputIds.props = Object.fromEntries(
      Object.entries($props).map(([propName, value]) => [propName, value.id])
    );

    return inputIds;
  }
};
