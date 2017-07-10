import meyda from 'meyda';
import store from '@/../store';

import { Menu, MenuItem } from 'nwjs-menu-browser';
import '@/../node_modules/nwjs-menu-browser/nwjs-menu-browser.css';
import contextMenuStore from './store';
import ContextMenuComponent from './Menu';

if(!window.nw) {
  window.nw = {
    Menu,
    MenuItem
  };
}

const nw = window.nw;

function buildMeydaMenu(moduleName, controlVariable) {
  const MeydaFeaturesSubmenu = new nw.Menu();
  var activeFeature = ''; //eslint-disable-line

  function clickFeature() {
    activeFeature = this.label;

    MeydaFeaturesSubmenu.items.forEach((item) => {
      item.checked = false;
      if(item.label === activeFeature) item.checked = true;
    });
    MeydaFeaturesSubmenu.rebuild();

    store.commit('meyda/assignFeatureToControl', {
      feature: this.label,
      moduleName,
      controlVariable
    });
  }

  Object.keys(meyda.featureExtractors).forEach((feature) => {
    MeydaFeaturesSubmenu.append(new nw.MenuItem({
      label: feature,
      type: 'checkbox',
      click: clickFeature
    }));
  });

  return MeydaFeaturesSubmenu;
}

function searchForSubMenus(menu) {
  let menus = [];

  menu.items.filter(item => !!item.submenu).forEach((item, idx) => {
    item.submenu.$id = `${menu.$id}-${idx}`;
    menus.push(item.submenu);
    menus = menus.concat(searchForSubMenus(item.submenu));
  });

  return menus;
}

function buildMenu(e, id, options, vnode, store) {
  e.preventDefault();
  const menu = new nw.Menu();
  menu.$id = id;

  options.menuItems.forEach((item, idx) => menu.insert(item, idx));

  const moduleName = vnode.context.moduleName;
  const controlVariable = vnode.context.variable;
  const MeydaFeaturesMenu = buildMeydaMenu(moduleName, controlVariable);
  menu.append(new nw.MenuItem({ label: 'Attach Feature', submenu: MeydaFeaturesMenu }));

  let menus = [];
  menus.push(menu);
  menus = menus.concat(searchForSubMenus(menu));
  console.log(menus);

  menus.forEach(menu => store.commit('contextMenu/addMenu', { Menu: menu, id: menu.$id }));

  store.dispatch('contextMenu/popup', { id, x: e.x, y: e.y });
  return false;
}

const ContextMenu = {
  install(Vue, { store }) {
    if(!store) throw new Error('No Vuex store detected');

    Vue.component('context-menu', ContextMenuComponent);

    Vue.directive('context-menu', {
      bind(el, binding, vnode/* , oldVnode*/) {
        // console.log(el, binding, vnode, oldVnode);

        el.addEventListener('contextmenu', (e) => {
          buildMenu(e, vnode.context._uid, binding.value, vnode, store); //eslint-disable-line
        });
      }
    });

    store.registerModule('contextMenu', contextMenuStore);
  }
};

export default ContextMenu;