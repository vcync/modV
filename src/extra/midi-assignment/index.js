import store from '@/../store';
import { modV } from 'modv';
import { MenuItem } from 'nwjs-menu-browser';
import midiAssignmentStore from './store';
import MIDIAssigner from './assigner';
import controlPanelComponent from './ControlPanel';

let assigner;

const queue = new Map();

const midiAssignment = {
  name: 'MIDI Assignment',
  controlPanelComponent,

  presetData: {
    save() {
      const { assignments, devices } = store.state.midiAssignment;

      return {
        assignments,
        devices,
      };
    },

    load(data) {
      const { assignments } = data;

      Object.keys(assignments).forEach((assignmentKey) => {
        store.commit('midiAssignment/setAssignment', {
          key: assignmentKey,
          value: assignments[assignmentKey],
        });

        // do something with devices (currently not used)
      });
    },
  },

  pluginData: {
    // save to be called on Plugin Store action
    save() {
      return {
        data: 'to save',
      };
    },

    load(data) {
      console.log('data loaded', data.data === 'to save');
    },
  },

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

    assigner = MIDIAssigner({
      get: store.getters['midiAssignment/assignment'],
      set(key, value) {
        store.commit('midiAssignment/setAssignment', { key, value });
      },
      callback: ({ assignment, message }) => {
        const midiEvent = message;
        const data = assignment.variable.split(',');

        const moduleName = data[0];
        const variableName = data[1];

        // the assignment is not for an internal control
        if (!data[2]) {
          const Module = store.getters['modVModules/getActiveModule'](moduleName);
          const control = Module.info.controls[variableName];

          let newValue = Math.map(midiEvent.data[2], 0, 127, control.min || 0, control.max || 1);

          if (control.varType === 'int') newValue = Math.round(newValue);

          queue.set(moduleName, { internal: false, key: variableName, value: newValue });

          return;
        }
        // the assignment is an internal control
        const type = data[1];

        // The "enable" button for the module
        if (type === 'enable') {
          /*
           * Only listen for On-events (button pressed)
           *
           * data[0] defines the specific MIDI "action" that gets triggered based
           * on which type the MIDI element has (for example a button might have
           * the type "Note"). Based on this we can handle different actions
           *
           * 1. Controlchange
           * - 176 = This is a Controlchange event
           * - 63 = Only listen for "button pressed", because this is the velocity
           * - 0 = If the velocity is zero, it's a "button released"
           *
           * 2. NoteOn
           * - 144 = This is a NoteOn event
           */
          if ((midiEvent.data[0] === 176 && (midiEvent.data[2] > 63 || midiEvent.data[2] === 0))
              || midiEvent.data[0] === 144) {
            const module = store.getters['modVModules/getActiveModule'](moduleName);
            const enabled = module.info.enabled;

            queue.set(moduleName, { internal: true, key: 'enabled', value: !enabled });
          }
        } else if(type === 'alpha') { //eslint-disable-line
          const value = Math.map(midiEvent.data[2], 0, 127, 0, 1);

          queue.set(moduleName, { internal: true, key: 'alpha', value });
        } else if(type === 'blending') { //eslint-disable-line

        }
      },
    });

    assigner.start();
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

  process() {
    queue.forEach((mapValue, mapKey) => {
      const moduleName = mapKey;
      const { internal, key, value } = mapValue;

      if (internal) {
        store.dispatch('modVModules/setActiveModuleInfo', {
          moduleName,
          key,
          value,
        });
      } else {
        store.dispatch('modVModules/setActiveModuleControlValue', {
          moduleName,
          variable: key,
          value,
        });
      }
    });

    queue.clear();
  },
};

export default midiAssignment;
