import { modV } from 'modv';
import { Menu, MenuItem } from 'nwjs-menu-browser';
import { startCase, toLower } from 'lodash-es';
import lfoStore from './store';

// info here: http://testtone.com/calculators/lfo-speed-calculator
function hzFromBpm(bpm = 120) {
  const secondsPerBeat = 60 / bpm;
  const secondsPerNote = secondsPerBeat * (4 / 2);
  const hertz = 1 / secondsPerNote;

  return hertz;
}

class LFOPlugin {
  constructor() {
    this.store = null;
    this.vue = null;
    this.delta = 0;
  }

  get waveforms() { //eslint-disable-line
    return [
      'sine',
      'sawtooth',
      'square',
      'noise',
    ];
  }

  install(Vue, { store }) {
    if (!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;
    store.registerModule('lfo', lfoStore);

    // Vue.component('expression', ExpressionComponent);

    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('lfo/removeAssignments', { moduleName: mutation.payload.moduleName });
      }
    });
  }

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  }

  // get component() { //eslint-disable-line
  //   return ExpressionComponent;
  // }

  createMenuItem(moduleName, controlVariable) {
    const LfoSubmenu = new Menu();
    const store = this.store;
    let label = 'Attach LFO';

    function attatchClick() {
      store.dispatch('lfo/addAssignment', {
        moduleName,
        controlVariable,
        waveform: toLower(this.label),
        frequency: hzFromBpm(store.getters['tempo/bpm']),
      });
    }

    function removeClick() {
      store.commit('lfo/removeAssignment', {
        moduleName,
        controlVariable,
      });
    }

    function editClick() {
      console.log('edit LFO');
    }

    const assignment = store.getters['lfo/assignment'](moduleName, controlVariable);
    if (assignment) {
      label = 'LFO';

      LfoSubmenu.append(new MenuItem({
        label: 'Edit LFO',
        type: 'normal',
        click: editClick,
      }));

      LfoSubmenu.append(new MenuItem({
        label: 'Remove LFO',
        type: 'normal',
        click: removeClick,
      }));
    } else {
      this.waveforms.forEach((waveform) => {
        LfoSubmenu.append(new MenuItem({
          label: startCase(waveform),
          type: 'normal',
          click: attatchClick,
        }));
      });
    }

    const LfoMenuItem = new MenuItem({ label, submenu: LfoSubmenu });
    return LfoMenuItem;
  }

  process() {
    const store = this.store;
    const assignments = store.getters['lfo/assignments'];

    Object.keys(assignments).forEach((moduleName) => {
      Object.keys(assignments[moduleName]).forEach((controlVariable) => {
        const assignment = assignments[moduleName][controlVariable];
        const module = store.getters['modVModules/getActiveModule'](moduleName);
        const control = module.info.controls[controlVariable];
        const currentValue = module[controlVariable];

        let value = currentValue;

        if (assignment) {
          const lfoController = assignment.controller;
          const min = control.min;
          const max = control.max;
          value = Math.map(lfoController.value, -1, 1, min, max);

          if (currentValue === value) return;

          store.commit('modVModules/setActiveModuleControlValue', {
            moduleName,
            variable: controlVariable,
            value,
          });
        }
      });
    });
  }

  makeValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line
    const store = this.store;
    const assignment = store.getters['lfo/assignment'](moduleName, controlVariable);
    const control = store.getters['modVModules/getActiveModule'](moduleName).info.controls[controlVariable];

    let value = currentValue;

    if (assignment) {
      const lfoController = assignment.controller;
      const min = control.min;
      const max = control.max;
      value = Math.map(lfoController.value, -1, 1, min, max);
    }

    return value;
  }
}

const lfoplugin = new LFOPlugin();

export default lfoplugin;
