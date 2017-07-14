import { modV } from 'modv';
import { Menu, MenuItem } from 'nwjs-menu-browser';
import meyda from 'meyda';

class FeatureAssignment {
  constructor() {
    this.store = null;
    this.vue = null;
  }

  install(Vue, { store }) {
    if(!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;
    // store.registerModule('midiAssignment', midiAssignmentStore);

    store.subscribe((mutation) => {
      if(mutation.type === 'modVModules/removeActiveModule') {
        store.commit('meyda/removeAssignments', mutation.payload.moduleName);
      }
    });
  }

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  }

  buildMeydaMenu(moduleName, controlVariable) {
    const MeydaFeaturesSubmenu = new Menu();
    const store = this.store;
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
      MeydaFeaturesSubmenu.append(new MenuItem({
        label: feature,
        type: 'checkbox',
        click: clickFeature
      }));
    });

    return MeydaFeaturesSubmenu;
  }

  createMenuItem(moduleName, controlVariable) {
    const MeydaFeaturesMenu = this.buildMeydaMenu(moduleName, controlVariable);
    const MeydaItem = new MenuItem({ label: 'Attach Feature', submenu: MeydaFeaturesMenu });

    return MeydaItem;
  }
}

const featureAssignment = new FeatureAssignment();
export default featureAssignment;