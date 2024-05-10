import modV from "../../application/index";
import constants from "../../application/constants";

export const GalleryItemContextMenu = ({ moduleName }) => [
  {
    label: moduleName,
    enabled: false,
  },
  {
    type: "separator",
  },
  {
    label: "Add to Group",
    submenu: modV.store.state.groups.groups
      .filter((group) => group.name !== constants.GALLERY_GROUP_NAME)
      .map(({ name: groupName, id: groupId }) => ({
        label: groupName,
        async click() {
          const { $id: moduleId } = await modV.store.dispatch(
            "modules/makeActiveModule",
            {
              moduleName,
            },
          );

          modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
            moduleId,
            groupId,
            position: modV.store.state.groups.groups.find(
              (group) => group.id === groupId,
            ).modules.length,
          });
        },
      })),
  },
];
