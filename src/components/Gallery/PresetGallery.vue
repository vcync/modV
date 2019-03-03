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
    <div class="column is-12">
      <div
        v-for="(preset, presetName) in project"
        :key="presetName"
        class="column is-12 preset-container"
      >
        <div
          v-if="validateModuleRequirements(preset.moduleData)"
          class="columns cannot-load"
        >
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
        <div v-else class="columns">
          <div class="column is-10">
            <span class="has-text-light">{{ preset.presetInfo.name }}</span>
          </div>

          <div class="column is-2">
            <button
              class="button is-dark is-inverted is-outlined"
              :class="{
                'is-loading':
                  loading === `${currentProjectName}.${preset.presetInfo.name}`
              }"
              @click="loadPreset({ presetName: preset.presetInfo.name })"
            >
              Load
            </button>
          </div>
        </div>
      </div>
    </div>
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

      nameError: false,
      nameErrorMessage: 'Preset must have a name',

      projectError: false,
      projectErrorMessage: 'Please select a project',

      newPresetName: '',
      newPresetProject: 'default'
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
      return Object.keys(moduleData)
        .map(datumKey => moduleData[datumKey].meta.originalName)
        .every(moduleName => Object.keys(this.registry).indexOf(moduleName) < 0)
    },
    async loadPreset({ presetName }) {
      const projectName = this.currentProjectName
      this.loading = `${projectName}.${presetName}`

      await this.loadPresetFromProject({ presetName, projectName })
      this.loading = null
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
