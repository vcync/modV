import store from '@/../store';
import { modV } from 'modv';
import { Menu, MenuItem } from 'nwjs-menu-browser';
import Meyda from 'meyda';

const featureAssignment = {
  name: 'Feature Assignment',

  install() {
    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('meyda/removeAssignments', { moduleName: mutation.payload.moduleName });
      }
    });
  },

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  },

  buildMeydaMenu(moduleName, controlVariable) {
    const MeydaFeaturesSubmenu = new Menu();
    let activeFeature = '';

    function clickFeature() {
      activeFeature = this.label;

      MeydaFeaturesSubmenu.items.forEach((item) => {
        item.checked = false;
        if (item.label === activeFeature) item.checked = true;
      });
      MeydaFeaturesSubmenu.rebuild();

      store.commit('meyda/assignFeatureToControl', {
        feature: this.label,
        moduleName,
        controlVariable,
      });
    }

    function clickRemoveAssignment() {
      store.commit('meyda/removeAssignments', { moduleName });
    }

    const assignments = store.getters['meyda/assignment'](moduleName, controlVariable);
    const assignedFeatures = [];

    if (assignments) {
      assignments
        .map(assignment => assignment.feature)
        .forEach(feature => assignedFeatures.push(feature));

      MeydaFeaturesSubmenu.append(new MenuItem({
        label: 'Remove Feature Assignment',
        type: 'normal',
        click: clickRemoveAssignment,
      }));

      MeydaFeaturesSubmenu.append(new MenuItem({
        type: 'separator',
      }));
    }

    Object.keys(Meyda.featureExtractors).forEach((feature) => {
      let shouldBeChecked = false;

      if (assignments) {
        shouldBeChecked = assignedFeatures.indexOf(feature) > -1;
      }

      MeydaFeaturesSubmenu.append(new MenuItem({
        label: feature,
        type: 'checkbox',
        checked: shouldBeChecked,
        click: clickFeature,
      }));
    });

    return MeydaFeaturesSubmenu;
  },

  createMenuItem(moduleName, controlVariable) {
    const MeydaFeaturesMenu = this.buildMeydaMenu(moduleName, controlVariable);
    const MeydaItem = new MenuItem({ label: 'Attach Feature', submenu: MeydaFeaturesMenu });

    return MeydaItem;
  },
};

export default featureAssignment;
