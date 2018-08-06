import Vue from 'vue';
import store from '@/../store';
import { modV } from '@/modv';
import packageData from '@/../package.json';

const state = {
  projects: {},
  currentProject: 'default',
};

// getters
const getters = {
  allProjects: state => state.projects,
  getPaletteFromProject: state => ({
    paletteName,
    projectName,
  }) => state.projects[projectName].palettes[paletteName],
};

// actions
const actions = {
  async savePresetToProject({}, { projectName, presetName }) { //eslint-disable-line
    const MediaManager = modV.MediaManagerClient;

    const preset = {};

    const datetime = Date.now();
    const author = store.getters['user/name'];
    const layers = await store.dispatch('layers/presetData');
    const moduleData = await store.dispatch('modVModules/presetData');
    const paletteData = await store.dispatch('palettes/presetData', Object.keys(moduleData));
    const pluginData = await store.dispatch('plugins/presetData');
    preset.layers = layers;
    preset.moduleData = moduleData;
    preset.paletteData = paletteData;
    preset.pluginData = pluginData;

    preset.presetInfo = {
      name: presetName || `Preset by ${author} at ${datetime}`,
      datetime,
      modvVersion: packageData.version,
      author: store.getters['user/name'],
    };

    MediaManager.send({
      request: 'save-preset',
      profile: projectName,
      name: presetName,
      payload: preset,
    });

    return preset;
  },
  loadPresetFromProject({}, { projectName, presetName }) { //eslint-disable-line
    const presetData = state.projects[projectName].presets[presetName];
    store.dispatch('projects/loadPreset', { presetData });
  },
  async loadPreset({}, { presetData }) { //eslint-disable-line
    await store.dispatch('layers/removeAllLayers');

    presetData.layers.forEach(async (Layer) => {
      const { index } = await store.dispatch('layers/addLayer');
      const layerIndex = index;

      store.commit('layers/setAlpha', { layerIndex, alpha: Layer.alpha });
      store.commit('layers/setBlending', { layerIndex, blending: Layer.blending });
      store.commit('layers/setClearing', { layerIndex, clearing: Layer.clearing });
      store.commit('layers/setCollapsed', { layerIndex, collapsed: Layer.collapsed });
      store.commit('layers/setDrawToOutput', { layerIndex, drawToOutput: Layer.drawToOutput });
      store.commit('layers/setEnabled', { layerIndex, enabled: Layer.enabled });
      store.commit('layers/setInherit', { layerIndex, inherit: Layer.inherit });
      store.commit('layers/setInheritFrom', { layerIndex, inheritFrom: Layer.inheritFrom });
      store.commit('layers/setLocked', { layerIndex, locked: Layer.locked });
      // store.commit('layers/setModuleOrder', { layerIndex, moduleOrder: Layer.moduleOrder });
      await store.dispatch('layers/setLayerName', { layerIndex, name: Layer.name });
      store.commit('layers/setPipeline', { layerIndex, pipeline: Layer.pipeline });

      Layer.moduleOrder.forEach(async (moduleName, idx) => {
        const module = await store.dispatch('modVModules/createActiveModule', { moduleName });
        const data = presetData.moduleData[moduleName];

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'alpha',
          data: data.meta.alpha,
        });

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'author',
          data: data.meta.author,
        });

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'compositeOperation',
          data: data.meta.compositeOperation,
        });

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'enabled',
          data: data.meta.enabled,
        });

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'alpha',
          data: data.meta.alpha,
        });

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'originalName',
          data: data.meta.originalName,
        });

        await store.dispatch('modVModules/updateMeta', {
          name: moduleName,
          metaKey: 'version',
          data: data.meta.version,
        });

        if ('import' in module) {
          module.import(data, moduleName);
        } else {
          Object.keys(data.values).forEach(async (variable) => {
            const value = data.values[variable];

            await store.dispatch('modVModules/updateProp', {
              name: moduleName,
              prop: variable,
              data: value,
            });
          });
        }

        store.dispatch('layers/addModuleToLayer', {
          module,
          layerIndex,
          position: idx,
        });
      });

      if ('pluginData' in presetData) {
        const pluginData = presetData.pluginData;
        const currentPlugins = store.state.plugins.plugins;

        Object.keys(pluginData)
          .filter(pluginDataKey => Object.keys(currentPlugins).indexOf(pluginDataKey) > -1)
          .filter(pluginDataKey => 'presetData' in currentPlugins[pluginDataKey].plugin)
          .forEach((pluginDataKey) => {
            const plugin = currentPlugins[pluginDataKey].plugin;
            plugin.presetData.load(pluginData[pluginDataKey]);
          });
      }
    });
  },
  savePaletteToProject({}, { projectName, paletteName, colors }) { //eslint-disable-line
    const MediaManager = modV.MediaManagerClient;

    MediaManager.send({
      request: 'save-palette',
      profile: projectName,
      name: paletteName,
      payload: colors,
    });
  },
  setCurrent({ commit, state }, { projectName }) {
    if (!state.projects[projectName]) throw Error('Project does not exist');

    commit('setCurrent', { projectName });
  },
};

// mutations
const mutations = {
  addProject(state, { projectName, images, palettes, presets, videos, modules, plugins }) {
    const project = {};
    project.images = images || {};
    project.palettes = palettes || {};
    project.presets = presets || {};
    project.videos = videos || {};
    project.modules = modules || {};
    project.plugins = plugins || {};

    Object.keys(project.modules).forEach((moduleName) => {
      fetch(project.modules[moduleName])
        .then(response => response.text())
        .then((text) => {
          store.dispatch('modVModules/register', {
            Module: eval(text).default, //eslint-disable-line
          });
        });
    });

    Vue.set(state.projects, projectName, project);
  },
  addPaletteToProject(state, { projectName, paletteName, colors }) {
    const project = state.projects[projectName];
    Vue.set(project.palettes, paletteName, colors);
  },
  addPresetToProject(state, { projectName, presetName, presetData }) {
    const project = state.projects[projectName];
    Vue.set(project.presets, presetName, presetData);
  },
  addModuleToProject(state, { projectName, presetName, path }) {
    const project = state.projects[projectName];

    fetch(path)
      .then(response => response.text())
      .then((text) => {
        store.dispatch('modVModules/register', {
          Module: eval(text).default, //eslint-disable-line
        });
      });

    Vue.set(project.modules, presetName, path);
  },
  addPluginToProject(state, { projectName, pluginName, pluginData }) {
    const project = state.projects[projectName];
    Vue.set(project.plugins, pluginName, pluginData);
  },
  setCurrent(state, { projectName }) {
    Vue.set(state, 'currentProject', projectName);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
