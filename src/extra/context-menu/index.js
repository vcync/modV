import meyda from 'meyda';
import store from '@/../store';

import { Menu, MenuItem } from 'nwjs-menu-browser';
import '@/../node_modules/nwjs-menu-browser/nwjs-menu-browser.css';
import contextMenuStore from './store';

if(!window.nw) {
  window.nw = {
    Menu,
    MenuItem
  };
}

const nw = window.nw;

// Add some items
const items = [];

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

function buildMenu(e, id, options, vnode, store) {
  e.preventDefault();

  if(store.getters['contextMenu/menu'](id)) {
    console.log(store.getters['contextMenu/menu'](id));
    const Menu = store.getters['contextMenu/menu'](id);
    store.dispatch('contextMenu/popdown', { id });
    Menu.node.parentNode.removeChild(Menu.node);
  }
  const menu = new nw.Menu();

  options.menuItems.forEach((item, idx) => menu.insert(item, idx));

  const moduleName = vnode.context.moduleName;
  const controlVariable = vnode.context.variable;
  const MeydaFeaturesMenu = buildMeydaMenu(moduleName, controlVariable);
  menu.append(new nw.MenuItem({ label: 'Attach Feature', submenu: MeydaFeaturesMenu }));

  items.forEach(item => menu.append(item));

  store.commit('contextMenu/addMenu', { Menu: menu, id });
  store.dispatch('contextMenu/popup', { id, x: e.x, y: e.y });
  return false;
}

const ContextMenu = {
  install(Vue, { store }) {
    if(!store) throw new Error('No Vuex store detected');

    Vue.directive('context-menu', {
      bind(el, binding, vnode, oldVnode) {
        console.log(el, binding, vnode, oldVnode);

        el.addEventListener('contextmenu', (e) => {
          buildMenu(e, vnode.context._uid, binding.value, vnode, store); //eslint-disable-line
        });
      }
    });

    store.registerModule('contextMenu', contextMenuStore);
  }
};

export default ContextMenu;