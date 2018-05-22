import Vue from 'vue';
import store from '@/../store';
import { modV } from '@/modv';
import packageData from '@/../package.json';

const state = {
  profiles: {},
};

// getters
const getters = {
  allProfiles: state => state.profiles,
  getPaletteFromProfile: state => ({
    paletteName,
    profileName,
  }) => state.profiles[profileName].palettes[paletteName],
};

// actions
const actions = {
  async savePresetToProfile({}, { profileName, presetName }) { //eslint-disable-line
    const MediaManager = modV.MediaManagerClient;

    const preset = {};

    const datetime = Date.now();
    const author = store.getters['user/name'];
    const layers = await store.dispatch('layers/presetData');
    const moduleData = await store.dispatch('modVModules/presetData');
    const paletteData = await store.dispatch('palettes/presetData', Object.keys(moduleData));
    preset.layers = layers;
    preset.moduleData = moduleData;
    preset.paletteData = paletteData;

    preset.presetInfo = {
      name: presetName || `Preset by ${author} at ${datetime}`,
      datetime,
      modvVersion: packageData.version,
      author: store.getters['user/name'],
    };

    MediaManager.send({
      request: 'save-preset',
      profile: profileName,
      name: presetName,
      payload: preset,
    });

    return preset;
  },
  loadPresetFromProfile({}, { profileName, presetName }) { //eslint-disable-line
    const presetData = state.profiles[profileName].presets[presetName];
    store.dispatch('profiles/loadPreset', { presetData });
  },
  loadPreset({}, { presetData }) { //eslint-disable-line
    store.dispatch('layers/removeAllLayers').then(() => {
      presetData.layers.forEach((Layer) => {
        store.dispatch('layers/addLayer').then(({ index }) => {
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
          store.commit('layers/setName', { layerIndex, name: Layer.name });
          store.commit('layers/setPipeline', { layerIndex, pipeline: Layer.pipeline });

          Layer.moduleOrder.forEach((moduleName, idx) => {
            store.dispatch('modVModules/createActiveModule', { moduleName }).then((module) => {
              const data = presetData.moduleData[moduleName];

              module.info.alpha = data.alpha;
              module.info.author = data.author;
              module.info.compositeOperation = data.compositeOperation;
              module.info.enabled = data.enabled;
              module.info.originalName = data.originalName;
              module.info.version = data.version;

              if ('import' in module) {
                console.log('import found in', module);
                module.import(data.values);
              } else {
                Object.keys(data.values).forEach((variable) => {
                  const value = data.values[variable];

                  console.log(variable, value);

                  store.commit('modVModules/setActiveModuleControlValue', {
                    moduleName,
                    variable,
                    value,
                  });
                });
              }

              store.dispatch('layers/addModuleToLayer', {
                module,
                layerIndex,
                position: idx,
              });
            });
          });
        });
      });
    });
  },
  savePaletteToProfile({}, { profileName, paletteName, colors }) { //eslint-disable-line
    const MediaManager = modV.MediaManagerClient;

    MediaManager.send({
      request: 'save-palette',
      profile: profileName,
      name: paletteName,
      payload: colors,
    });
  },
};

// mutations
const mutations = {
  addProfile(state, { profileName, images, palettes, presets, videos, modules }) {
    const profile = {};
    profile.images = images || {};
    profile.palettes = palettes || {};
    profile.presets = presets || {};
    profile.videos = videos || {};
    profile.modules = modules || {};

    Vue.set(state.profiles, profileName, profile);
  },
  addPaletteToProfile(state, { profileName, paletteName, colors }) {
    const profile = state.profiles[profileName];
    Vue.set(profile.palettes, paletteName, colors);
  },
  addPresetToProfile(state, { profileName, presetName, presetData }) {
    const profile = state.profiles[profileName];
    Vue.set(profile.presets, presetName, presetData);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
