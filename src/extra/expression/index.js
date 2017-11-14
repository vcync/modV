import { modV } from 'modv';
import { MenuItem } from 'nwjs-menu-browser';
import expressionStore from './store';
import ExpressionComponent from './ExpressionInput';

class Expression {
  constructor() {
    this.store = null;
    this.vue = null;
    this.delta = 0;
  }

  install(Vue, { store }) {
    if(!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;
    store.registerModule('expression', expressionStore);

    Vue.component('expression', ExpressionComponent);

    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('expression/removeExpressions', { moduleName: mutation.payload.moduleName });
      }
    });
  }

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  }

  get component() { //eslint-disable-line
    return ExpressionComponent;
  }

  createMenuItem(moduleName, controlVariable) {
    const store = this.store;

    function click() {
      store.dispatch('expression/setActiveControlData', {
        moduleName,
        controlVariable
      });
    }

    const menuItem = new MenuItem({
      label: 'Edit expression',
      click: click.bind(this)
    });

    return menuItem;
  }

  process({ delta }) { //eslint-disable-line
    this.delta = delta;
  }

  processValue({ currentValue, moduleName, controlVariable }) {
    const store = this.store;
    let value = currentValue;

    const assignment = store.getters['expression/assignment'](moduleName, controlVariable);

    if(assignment) {
      const additionalScope = assignment.additionalScope;

      const scope = {
        value: currentValue,
        delta: this.delta
      };

      Object.keys(additionalScope).forEach((key) => {
        scope[key] = additionalScope[key];
      });

      value = assignment.func.eval(scope);
    }

    return value;
  }
}

const expression = new Expression();

export default expression;
