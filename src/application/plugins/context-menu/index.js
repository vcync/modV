import { Menu } from "nwjs-menu-browser";
import contextMenuStore from "./store";
import ContextMenuHandler from "./MenuHandler";

function searchForSubMenus(menu) {
  let menus = [];
  const submenus = [];

  const parentItems = menu.items.filter(item => !!item.submenu);
  for (let i = 0, len = parentItems.length; i < len; ++i) {
    const item = parentItems[i];

    item.submenu.$id = `${menu.$id}-${i}`;
    item.submenu.isSubmenu = true;
    menus.push(item.submenu);
    submenus.push(item.submenu);
    menus = menus.concat(searchForSubMenus(item.submenu));
  }
  menu.submenus = submenus;

  return menus;
}

function buildMenu(e, id, options, vnode, store) {
  e.preventDefault();
  const menu = new Menu();
  menu.$id = id;
  menu.isSubmenu = false;

  if ("createMenus" in options) {
    if (typeof options.createMenus === "function") {
      options.createMenus();
    }
  }

  const menuItems = options.menuItems;
  for (let i = 0, len = menuItems.length; i < len; ++i) {
    menu.insert(menuItems[i], i);
  }

  // const moduleName = vnode.context.moduleName;
  // const controlVariable = vnode.context.variable;
  // const group = vnode.context.group;
  // const groupName = vnode.context.groupName;

  const hooks = store.getters["contextMenu/hooks"];
  let hookItems = [];

  const availableOptions = options.match;
  for (let i = 0, len = availableOptions.length; i < len; ++i) {
    const hook = availableOptions[i];

    if (hook in hooks) {
      hookItems = hookItems.concat(hooks[hook]);
    }
  }

  // for (let i = 0, len = hookItems.length; i < len; ++i) {
  //   const item = hookItems[i];

  //   if (options.internalVariable) {
  //     menu.append(
  //       item.buildMenuItem(moduleName, options.internalVariable, true)
  //     );
  //   } else {
  //     menu.append(
  //       item.buildMenuItem(moduleName, controlVariable, group, groupName)
  //     );
  //   }
  // }

  let menus = [];
  menus.push(menu);
  menus = menus.concat(searchForSubMenus(menu));

  for (let i = 0, len = menus.length; i < len; ++i) {
    const menu = menus[i];
    store.commit("contextMenu/addMenu", { Menu: menu, id: menu.$id });
  }

  store.dispatch("contextMenu/popup", { id, x: e.x, y: e.y });
  return false;
}

const ContextMenu = {
  name: "Context Menu",
  uiStore: contextMenuStore,

  install(Vue, _, uiStore) {
    Vue.component(ContextMenuHandler.name, ContextMenuHandler);

    Vue.directive("context-menu", {
      bind(el, binding, vnode) {
        el.addEventListener("contextmenu", e => {
          buildMenu(e, vnode.context._uid, binding.value, vnode, uiStore);
        });
      }
    });
  },
  component: ContextMenuHandler
};

export default ContextMenu;
