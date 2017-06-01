import Ball from '@/modv/sample-modules/Ball';

class Waveform {
  constructor() {
    this.info = {
      name: 'Waveform',
      author: '2xAA',
      version: '1.0'
    };

    this.hue = 0;
  }

  draw(canvas, context) {
    const ctx = context;

    ctx.fillStyle = `hsl(${this.hue}, 50%, 50%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.hue += 3;
    if (this.hue > 360) this.hue = 0;
  }
}

const state = {
  active: {},
  registered: {
    Waveform,
    Ball
  }
};

function generateName(name) {
  let dupeNo = 1;

  if(name in state.active) {
    let dupeName = `${name} (${dupeNo})`;
    while(dupeName in state.active) {
      dupeNo += 1;
      dupeName = `${name} (${dupeNo})`;
    }
    return dupeName;
  }

  return name;
}

// getters
const getters = {
  registeredModules: state => state.registered,
  activeModules: state => state.active
};

// actions
const actions = {
  createActiveModule({ commit, state }, { moduleName }) {
    const module = new state.registered[moduleName]();
    const newModuleName = generateName(module.info.name);
    module.info.name = newModuleName;

    if('init' in module) module.init({ width: 50, height: 50 });

    commit('addActiveModule', { module });
    return module;
  }
};

// mutations
const mutations = {
  addActiveModule(stateIn, { module }) {
    const state = stateIn;
    state.active[module.info.name] = module;
  },
  removeActiveModule(stateIn, { moduleName }) {
    const state = stateIn;
    delete state.active[moduleName];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};