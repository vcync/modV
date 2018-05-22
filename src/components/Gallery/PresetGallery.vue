<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <h2 class="title">Save preset</h2>
      <div class="columns">

        <div class="column">

          <b-field
            :type="nameError ? 'is-danger' : ''"
            :message="nameError ? nameErrorMessage : ''"
          >
            <b-input
              placeholder="Preset name"
              v-model="newPresetName"
            ></b-input>
          </b-field>

        </div>
        <div class="column is-2">

          <b-field
            :type="profileError ? 'is-danger' : ''"
            :message="profileError ? profileErrorMessage : ''"
          >
            <b-select placeholder="Profile name" v-model="newPresetProfile">
              <option
                v-for="(profile, profileName) in profiles"
                :value="profileName"
                :key="profileName"
              >{{ profileName }}</option>
            </b-select>
          </b-field>

        </div>
        <div class="column is-2">

          <div class="field">
            <div class="control">
              <button
                class="button"
                @click="savePreset"
              >Save</button>
            </div>
          </div>
        </div>

      </div>
    </div>
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

        nameError: false,
        nameErrorMessage: 'Preset must have a name',

        profileError: false,
        profileErrorMessage: 'Please select a profile',

        newPresetName: '',
        newPresetProfile: '',
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
        'savePresetToProfile',
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
      async savePreset() {
        this.nameError = false;
        this.profileError = false;

        if (!this.newPresetName.trim().length) {
          this.nameError = true;
          return;
        }

        if (!this.newPresetProfile.trim().length) {
          this.profileError = true;
          return;
        }

        await this.savePresetToProfile({
          presetName: this.newPresetName,
          profileName: this.newPresetProfile,
        });

        this.newPresetName = '';
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
