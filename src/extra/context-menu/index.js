import store from '@/../store';
import { Menu } from 'nwjs-menu-browser';
// import '@/../node_modules/nwjs-menu-browser/nwjs-menu-browser.css';
import contextMenuStore from './store';
import ContextMenuHandler from './MenuHandler';

function searchForSubMenus(menu) {
  let menus = [];
  const submenus = [];

  menu.items.filter(item => !!item.submenu).forEach((item, idx) => {
    item.submenu.$id = `${menu.$id}-${idx}`;
    item.submenu.isSubmenu = true;
    menus.push(item.submenu);
    submenus.push(item.submenu);
    menus = menus.concat(searchForSubMenus(item.submenu));
  });
  menu.submenus = submenus;

  return menus;
}

function buildMenu(e, id, options, vnode, store) {
  e.preventDefault();
  const menu = new Menu();
  menu.$id = id;
  menu.isSubmenu = false;

  if ('createMenus' in options) {
    if (typeof options.createMenus === 'function') {
      options.createMenus();
    }
  }

  options.menuItems.forEach((item, idx) => menu.insert(item, idx));

  const moduleName = vnode.context.moduleName;
  const controlVariable = vnode.context.variable;

  const hooks = store.getters['contextMenu/hooks'];
  let hookItems = [];

  options.match.forEach((hook) => {
    if (hook in hooks) hookItems = hookItems.concat(hooks[hook]);
  });

  hookItems.forEach((item) => {
    if (options.internalVariable) {
      menu.append(item.buildMenuItem(
        moduleName,
        options.internalVariable,
        true,
      ));
    } else {
      menu.append(item.buildMenuItem(
        moduleName,
        controlVariable,
      ));
    }
  });

  let menus = [];
  menus.push(menu);
  menus = menus.concat(searchForSubMenus(menu));

  menus.forEach(menu => store.commit('contextMenu/addMenu', { Menu: menu, id: menu.$id }));

  store.dispatch('contextMenu/popup', { id, x: e.x, y: e.y });
  return false;
}

const ContextMenu = {
  name: 'Context Menu',

  install(Vue) {
    Vue.component('contextMenuHandler', ContextMenuHandler);

    Vue.directive('context-menu', {
      bind(el, binding, vnode) {
        el.addEventListener('contextmenu', (e) => {
          buildMenu(e, vnode.context._uid, binding.value, vnode, store); //eslint-disable-line
        });
      },
    });

    store.registerModule('contextMenu', contextMenuStore);
  },
  component: ContextMenuHandler,
};

export default ContextMenu;
