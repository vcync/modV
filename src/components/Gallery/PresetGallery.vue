<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <h2 class="title">Save preset</h2>
      <div class="columns">
        <div class="column is-10">
          <b-field
            :type="nameError ? 'is-danger' : ''"
            :message="nameError ? nameErrorMessage : ''"
          >
            <b-input
              v-model="newPresetName"
              placeholder="Preset name"
            ></b-input>
          </b-field>
        </div>
        <div class="column is-2">
          <div class="field">
            <div class="control">
              <button class="button" @click="savePreset">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-12 preset-container">
      <div v-for="(preset, index) in project" :key="index">
        <div class="columns">
          <div class="column is-10">
            <span class="has-text-light preset-name">{{
              preset.presetInfo.name
            }}</span>
          </div>

          <div class="column is-2">
            <button
              class="button is-dark is-inverted is-outlined"
              :class="{
                'is-loading':
                  loading === `${currentProjectName}.${preset.presetInfo.name}`
              }"
              @click="loadPreset({ presetName: preset.presetInfo.name, index })"
            >
              Load
            </button>
          </div>
        </div>
      </div>
    </div>

    <b-modal :active.sync="isComponentModalActive" has-modal-card>
      <div class="modal-card">
        <header class="modal-card-head has-text-dark">
          Preset "{{
            project[loadingIndex] && project[loadingIndex].presetInfo.name
          }}" is missing Modules
        </header>
        <section class="modal-card-body has-text-dark">
          <p>Missing module(s):</p>
          <ul>
            <li v-for="moduleName in missingModuleNames" :key="moduleName">
              {{ moduleName }}
            </li>
          </ul>
          <p>
            <br />
            Please install the missing Modules to use the preset correctly.
          </p>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button class="button" type="button" @click="continueLoad(true)">
            Load anyway
          </button>
          <button
            class="button is-primary"
            type="button"
            @click="continueLoad(false)"
          >
            Cancel
          </button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import naturalSort from '@/modv/utils/natural-sort'

export default {
  name: 'PresetGallery',
  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      loading: null,
      loadingModuleData: null,
      loadingIndex: null,

      nameError: false,
      nameErrorMessage: 'Preset must have a name',

      projectError: false,
      projectErrorMessage: 'Please select a project',

      newPresetName: '',
      newPresetProject: 'default',

      isComponentModalActive: false
    }
  },
  computed: {
    ...mapGetters('projects', ['currentProject']),
    ...mapGetters('modVModules', ['registry']),
    currentProjectName() {
      return this.$store.state.projects.currentProject
    },
    project() {
      const data = []
      if (!this.currentProject) return data

      Object.keys(this.currentProject.presets)
        .sort(naturalSort.compare)
        .forEach(presetName => {
          data.push(this.currentProject.presets[presetName])
        })

      return data
    },

    missingModuleNames() {
      return (
        this.getMissingModules(
          this.project[this.loadingIndex] &&
            this.project[this.loadingIndex].moduleData
        ) || []
      )
    }
  },
  watch: {
    isComponentModalActive(value) {
      if (!value) {
        this.loading = null
        this.loadingIndex = null
        this.loadingPresetName = null
      }
    }
  },
  methods: {
    ...mapActions('projects', ['loadPresetFromProject', 'savePresetToProject']),
    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim()
      const term = termIn.toLowerCase().trim()
      if (termIn.length < 1) return true

      return text.indexOf(term) > -1
    },
    makeStyle(rgb) {
      return {
        backgroundColor: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
      }
    },
    validateModuleRequirements(moduleData) {
      return !Object.keys(moduleData)
        .map(datumKey => moduleData[datumKey].meta.originalName)
        .every(moduleName => Object.keys(this.registry).indexOf(moduleName) < 0)
    },
    getMissingModules(moduleData) {
      return (
        moduleData &&
        Object.keys(moduleData)
          .map(datumKey => moduleData[datumKey].meta.originalName)
          .filter(
            moduleName => Object.keys(this.registry).indexOf(moduleName) < 0
          )
      )
    },
    continueLoad(cont) {
      this.isComponentModalActive = false

      if (cont) {
        this.loadPreset({
          presetName: this.loadingPresetName,
          index: this.loadingIndex,
          override: true
        })
        return
      }

      this.loading = null
      this.loadingIndex = null
      this.loadingPresetName = null
    },
    async loadPreset({ presetName, index, override }) {
      const projectName = this.currentProjectName
      this.loading = `${projectName}.${presetName}`
      this.loadingIndex = index
      this.loadingPresetName = presetName

      if (
        !this.validateModuleRequirements(this.project[index].moduleData) &&
        !override
      ) {
        this.isComponentModalActive = true
      } else {
        this.isComponentModalActive = false
        this.loading = `${projectName}.${presetName}`

        await this.loadPresetFromProject({ presetName, projectName })
        this.loading = null
        this.loadingIndex = null
        this.loadingPresetName = null
      }
    },
    async savePreset() {
      this.nameError = false
      this.projectError = false

      if (!this.newPresetName.trim().length) {
        this.nameError = true
        return
      }

      if (!this.newPresetProject.trim().length) {
        this.projectError = true
        return
      }

      await this.savePresetToProject({
        presetName: this.newPresetName,
        projectName: this.currentProjectName
      })

      this.newPresetName = ''
    }
  }
}
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
  .column {
    align-items: center;
    display: flex;

    span.preset-name {
      margin-left: 1em;
    }
  }

  transition: all 120ms;

  .columns:hover {
    background-color: whitesmoke;

    &.cannot-load {
      background-color: transparent;
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
