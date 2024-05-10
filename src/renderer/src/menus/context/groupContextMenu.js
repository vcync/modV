import modV from "../../application/index";

export const GroupContextMenu = ({ group: { name, id: groupId } }) => [
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
      modV.store.dispatch("groups/removeGroup", { groupId });
    }
  }
];
