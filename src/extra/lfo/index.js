import store from '@/../store';
import { modV } from 'modv';
import { Menu, MenuItem } from 'nwjs-menu-browser';
import { startCase, toLower } from 'lodash-es';
import lfoStore from './store';
import lfoTypes from './lfo-types';

// info here: http://testtone.com/calculators/lfo-speed-calculator
function hzFromBpm(bpm = 120) {
  const secondsPerBeat = 60 / bpm;
  const secondsPerNote = secondsPerBeat * (4 / 2);
  const hertz = 1 / secondsPerNote;

  return hertz;
}

const lfoplugin = {
  name: 'LFO',
  waveforms: lfoTypes,
  store: lfoStore,
  storeName: 'lfo',

  install() {
    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('lfo/removeAssignments', { moduleName: mutation.payload.moduleName });
      }

      if (mutation.type === 'tempo/setBpm') {
        store.dispatch('lfo/updateBpmFrequency', { frequency: hzFromBpm(mutation.payload.bpm) });
      }
    });

    modV.addContextMenuHook({
      hook: 'rangeControl',
      buildMenuItem: this.createMenuItem.bind(this),
    });
  },

  createMenuItem(moduleName, controlVariable) {
    const LfoSubmenu = new Menu();
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
      store.dispatch('lfo/setActiveControlData', {
        moduleName,
        controlVariable,
      });
    }

    const assignment = store.getters['lfo/assignment']({ moduleName, controlVariable });
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
  },

  process() { //eslint-disable-line
    const assignments = store.getters['lfo/assignments'];

    Object.keys(assignments).forEach((moduleName) => {
      Object.keys(assignments[moduleName]).forEach((controlVariable) => {
        const assignment = assignments[moduleName][controlVariable];
        const module = store.state.modVModules.active[moduleName];
        const control = module.props[controlVariable];
        const currentValue = module[controlVariable];

        let value = currentValue;

        if (assignment) {
          const lfoController = assignment.controller;
          const { min, max } = control;
          value = Math.map(lfoController.value, -1, 1, min, max);

          if (currentValue === value) return;

          store.dispatch('modVModules/updateProp', {
            name: moduleName,
            prop: controlVariable,
            data: value,
          });
        }
      });
    });
  },

  makeValue({ currentValue, moduleName, controlVariable }) { //eslint-disable-line
    const assignment = store.getters['lfo/assignment']({ moduleName, controlVariable });
    const control = store.state.modVModules.active[moduleName].props[controlVariable];

    let value = currentValue;

    if (assignment) {
      const lfoController = assignment.controller;
      const min = control.min;
      const max = control.max;
      value = Math.map(lfoController.value, -1, 1, min, max);
    }

    return value;
  },
};

export default lfoplugin;
