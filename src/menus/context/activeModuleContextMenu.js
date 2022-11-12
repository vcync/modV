import modV from "../../application/index";
import uiStore from "../../ui-store";

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
      uiStore.dispatch("ui-modules/removeActiveModule", {
        groupId,
        moduleId
      });
    }
  },
  {
    type: "separator"
  },
  {
    label: "Duplicate",
    click() {
      modV.store.dispatch("groups/duplicateModule", { groupId, moduleId });
    }
  }
];
