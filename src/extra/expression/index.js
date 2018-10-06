import store from '@/../store';
import { modV } from 'modv';
import { MenuItem } from 'nwjs-menu-browser';
import modvVue from '@/main';

import expressionStore from './store';
import ExpressionComponent from './ExpressionInput';

const Expression = {
  name: 'Value Expression',
  store: expressionStore,
  storeName: 'expression',

  install() {
    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('expression/removeExpressions', { moduleName: mutation.payload.moduleName });
      }
    });

    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  },

  createMenuItem(moduleName, controlVariable) {
    async function click() {
      await store.dispatch('expression/setActiveControlData', {
        moduleName,
        controlVariable,
      });

      modvVue.$modal.open({
        parent: modvVue,
        component: ExpressionComponent,
        hasModalCard: true,
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
