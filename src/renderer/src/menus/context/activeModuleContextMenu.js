import modV from "../../application/index";
import uiStore from "../../ui-store";
import getPropDefault from "../../application/utils/get-prop-default";

export const ActiveModuleContextMenu = ({
  activeModule: {
    meta: { name },
    $id: moduleId
  },
  groupId
}) => [
  {
    label: name,
    enabled: false
  },
  {
    type: "separator"
  },
  {
    label: "Delete",
    async click() {
      uiStore.dispatch("uiModules/removeActiveModule", {
        groupId,
        moduleId
      });
    }
  },
  {
    label: "Duplicate",
    click() {
      modV.store.dispatch("groups/duplicateModule", { groupId, moduleId });
    }
  },
  {
    type: "separator"
  },
  {
    label: "Reset props to default values",
    async click() {
      const activeModule = modV.store.state.modules.active[moduleId];
      const propsKeys = Object.keys(activeModule.$props);
      for (let i = 0; i < propsKeys.length; i += 1) {
        const propKey = propsKeys[i];
        const prop = activeModule.$props[propKey];
        const defaultPropValue = await getPropDefault(
          activeModule,
          propKey,
          prop
        );

        modV.store.dispatch("modules/updateProp", {
          moduleId,
          prop: propKey,
          data: defaultPropValue
        });
      }
    }
  }
];
