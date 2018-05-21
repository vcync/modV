<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <span v-for="(profile, profileName) in profiles">
        <h2 class="title">{{ profileName }}</h2>
        <div class="columns is-gapless is-multiline">
          <div
            class="column is-12 preset-container"
            v-for="(preset, presetName) in profile.presets"
          >
            <div class="columns cannot-load" v-if="!validateModuleRequirements(preset.moduleData)">

              <div class="column is-10">
                <span class="has-text-grey">{{ preset.presetInfo.name }}</span>
              </div>

              <div class="column is-2">
                <b-tooltip
                  label="Missing modules"
                  type="is-danger"
                  position="is-left"
                >
                  <button class="button is-dark" disabled>Load</button>
                </b-tooltip>
              </div>
            </div>
            <div class="columns" v-else>

              <div class="column is-10">
                <span class="has-text-light">{{ preset.presetInfo.name }}</span>
              </div>

              <div class="column is-2">
                <button
                  class="button is-dark is-inverted is-outlined"
                  :class="{ 'is-loading': loading === `${profileName}.${presetName}` }"
                  @click="loadPreset({ presetName, profileName })"
                >Load</button>
              </div>
            </div>

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
    data() {
      return {
        loading: null,
      };
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
      async loadPreset({ presetName, profileName }) {
        this.loading = `${profileName}.${presetName}`;

        await this.loadPresetFromProfile({ presetName, profileName });
        this.loading = null;
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

  .column.preset-container {
    margin: 0 5pt;
    padding: 5pt !important;

    .column {
      align-items: center;
      display: flex;
    }

    transition: all 120ms;

    & > .columns:hover {
      background-color: whitesmoke;

      &.cannot-load {
        background-color: #797979;
      }

      .has-text-light,
      .button {
        color: #383838 !important;
      }

      .button {
        border-color: #383838 !important;
      }
    }
  }
</style>
