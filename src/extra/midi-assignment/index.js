import { modV } from 'modv';
import { MenuItem } from 'nwjs-menu-browser';
import midiAssignmentStore from './store';
import MIDIAssigner from './assigner';

class Expression {
  constructor() {
    this.store = null;
    this.vue = null;
    this.delta = 0;
    this.assigner = null;
  }

  install(Vue, { store }) {
    if(!store) throw new Error('No Vuex store detected');
    this.store = store;
    this.vue = Vue;
    store.registerModule('midiAssignment', midiAssignmentStore);

    store.subscribe((mutation) => {
      if(mutation.type === 'modVModules/removeActiveModule') {
        store.commit('midiAssignment/removeAssignments', mutation.payload.moduleName);
      }
    });

    this.assigner = new MIDIAssigner({
      get: store.getters['midiAssignment/assignment'],
      set(key, value) {
        store.commit('midiAssignment/setAssignment', { key, value });
      }
    });

    this.assigner.start();
    this.assigner.on('midiAssignmentInput', (channel, assignment, midiEvent) => {
      const data = assignment.variable.split(',');
      const moduleName = data[0];
      const variableName = data[1];
      const Module = store.getters['modVModules/getActiveModule'](moduleName);
      const control = Module.info.controls[variableName];

      let newValue = Math.map(midiEvent.data[2], 0, 127, control.min || 0, control.max || 1);

      if(control.varType === 'int') newValue = Math.round(newValue);

      store.commit('modVModules/setActiveModuleControlValue', {
        moduleName,
        variable: variableName,
        value: newValue
      });
    });
  }

  modvInstall() {
    modV.addContextMenuHook({ hook: 'rangeControl', buildMenuItem: this.createMenuItem.bind(this) });
  }

  createMenuItem(moduleName, controlVariable) {
    function click() {
      this.assigner.learn(`${moduleName},${controlVariable}`);
    }

    const MidiItem = new MenuItem({
      label: 'Learn MIDI assignment',
      click: click.bind(this)
    });

    return MidiItem;
  }
}

const expression = new Expression();

export default expression;