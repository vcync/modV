import modV from "../../application/index";
import getPropDefault from "../../application/utils/get-prop-default";

export const ActiveModuleControlContextMenu = async ({
  moduleId,
  propName,
  title
}) => {
  const activeModule = modV.store.state.modules.active[moduleId];
  const prop = activeModule.$props[propName];
  const defaultPropValue = await getPropDefault(activeModule, propName, prop);

  if (typeof defaultPropValue === "object") {
    return undefined;
  }

  return [
    {
      label: title,
      enabled: false
    },
    {
      type: "separator"
    },
    {
      label: `Reset to "${defaultPropValue}"`,
      async click() {
        modV.store.dispatch("modules/updateProp", {
          moduleId,
          prop: propName,
          data: defaultPropValue
        });
      }
    }
  ];
};
