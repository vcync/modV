import store from '@/../store';
import { modV } from 'modv';
import { MenuItem } from 'nwjs-menu-browser';
import expressionStore from './store';

const Expression = {
  name: 'Value Expression',

  install() {
    store.registerModule('expression', expressionStore);

    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('expression/removeExpressions', { moduleName: mutation.payload.moduleName });
      }
    });
  },

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  },

  createMenuItem(moduleName, controlVariable) {
    function click() {
      store.dispatch('expression/setActiveControlData', {
        moduleName,
        controlVariable,
      });
    }

    const menuItem = new MenuItem({
      label: 'Edit expression',
      click: click.bind(this),
    });

    return menuItem;
  },

  processValue({ delta, currentValue, moduleName, controlVariable }) {
    let value = currentValue;

    const assignment = store.getters['expression/assignment'](moduleName, controlVariable);

    if (assignment) {
      const additionalScope = assignment.additionalScope;

      const scope = {
        value: currentValue,
        delta,
        map: Math.map,
      };

      Object.keys(additionalScope).forEach((key) => {
        scope[key] = additionalScope[key];
      });

      value = assignment.func.eval(scope);
    }

    return value;
  },
};

export default Expression;
