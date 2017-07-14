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
      if(mutation.type === 'modVModules/removeActiveModule') {
        store.commit('expression/removeExpressions', mutation.payload.moduleName);
      }
    });
  }

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
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

    const assignment = store.getters['expression/assignment'](moduleName, controlVariable);

    let value = currentValue;

    if(assignment) {
      value = assignment.func.eval({
        value: currentValue,
        delta: this.delta
      });
    }

    return value;
  }
}

const expression = new Expression();

export default expression;