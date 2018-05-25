import store from '@/../store';
import { modV } from 'modv';
import { MenuItem } from 'nwjs-menu-browser';
import midiAssignmentStore from './store';
import MIDIAssigner from './assigner';
import controlPanelComponent from './ControlPanel';

let assigner;

const midiAssignment = {
  name: 'MIDI Assignment',
  controlPanelComponent,

  install(Vue) {
    Vue.component(controlPanelComponent.name, controlPanelComponent);
    store.registerModule('midiAssignment', midiAssignmentStore);

    store.subscribe((mutation) => {
      if (mutation.type === 'modVModules/removeActiveModule') {
        store.commit('midiAssignment/removeAssignments', {
          moduleName: mutation.payload.moduleName,
        });
      }
    });

    assigner = new MIDIAssigner({
      get: store.getters['midiAssignment/assignment'],
      set(key, value) {
        store.commit('midiAssignment/setAssignment', { key, value });
      },
    });

    assigner.start();
    assigner.on('midiAssignmentInput', (channel, assignment, midiEvent) => {
      const data = assignment.variable.split(',');

      const moduleName = data[0];
      const variableName = data[1];

      // the assignment is not for an internal control
      if (!data[2]) {
        const Module = store.getters['modVModules/getActiveModule'](moduleName);
        const control = Module.info.controls[variableName];

        let newValue = Math.map(midiEvent.data[2], 0, 127, control.min || 0, control.max || 1);

        if (control.varType === 'int') newValue = Math.round(newValue);

        store.dispatch('modVModules/setActiveModuleControlValue', {
          moduleName,
          variable: variableName,
          value: newValue,
        });
      } else {
        // the assignment is an internal control
        const type = data[1];

        if (type === 'enable') {
          const value = !!Math.round(Math.map(midiEvent.data[2], 0, 127, 0, 1));
          store.commit('modVModules/setActiveModuleEnabled', {
            moduleName,
            enabled: value,
          });
        } else if(type === 'alpha') { //eslint-disable-line
          const value = Math.map(midiEvent.data[2], 0, 127, 0, 1);
          store.commit('modVModules/setActiveModuleAlpha', {
            moduleName,
            alpha: value,
          });
        } else if(type === 'blending') { //eslint-disable-line

        }
      }
    });
  },

  modvInstall() {
    modV.addContextMenuHook({
      hook: 'rangeControl',
      buildMenuItem: this.createMenuItem.bind(this),
    });

    modV.addContextMenuHook({
      hook: '@modv/module:internal',
      buildMenuItem: this.createMenuItem.bind(this),
    });
  },

  createMenuItem(moduleName, controlVariable, internal) {
    function click() {
      let assignmentString = `${moduleName},${controlVariable}`;

      if (internal) {
        assignmentString += ',internal';
      }

      assigner.learn(assignmentString);
    }

    const MidiItem = new MenuItem({
      label: 'Learn MIDI assignment',
      click: click.bind(this),
    });

    return MidiItem;
  },
};

export default midiAssignment;
