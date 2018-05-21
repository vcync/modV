<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <span v-for="(profile, profileName) in profiles">
        <h2 class="title">{{ profileName }}</h2>
        <div class="columns is-gapless is-multiline">
          <div class="column is-12 palette-container" v-for="(preset, presetName) in profile.presets">
            <span class="has-text-light">{{ preset.presetInfo.name }}</span>

            <b-tooltip
              v-if="!validateModuleRequirements(preset.moduleData)"
              label="Missing modules"
              type="is-danger"
            >
              <button class="button is-dark" disabled>Can't Load</button>
            </b-tooltip>
            <button
              v-else
              class="button is-dark"
              @click="loadPresetFromProfile({ presetName, profileName })"
            >Load</button>
          </div>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';

  export default {
    name: 'presetGallery',
    components: {

    },
    props: {
      phrase: {
        type: String,
        required: true,
        default: '',
      },
    },
    computed: {
      ...mapGetters('profiles', {
        profiles: 'allProfiles',
      }),
      ...mapGetters('modVModules', [
        'registry',
      ]),
    },
    methods: {
      ...mapActions('profiles', [
        'loadPresetFromProfile',
      ]),
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
      },
      makeStyle(rgb) {
        return {
          backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`,
        };
      },
      validateModuleRequirements(moduleData) {
        return Object.keys(moduleData)
          .map(datumKey => moduleData[datumKey].originalModuleName)
          .every(moduleName => Object.keys(this.registry).indexOf(moduleName) < 0);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .hidden {
    display: none !important;
  }

  h2.title {
    color: #fff;
    cursor: default;
    font-weight: normal;
    margin: 0.82em 5pt 0.2em 5pt;
  }

  .swatch {
    border-radius: 50%;
    display: inline-block;
    height: 10px;
    width: 10px;
    margin: 3px;
  }

  .column.palette-container {
    margin: 0 5pt;
  }
</style>
