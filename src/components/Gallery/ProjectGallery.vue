<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div
      v-for="(project, projectName) in projects"
      class="column is-12 preset-container"
    >
      <div class="columns">
        <div class="column is-10">
          <span class="has-text-light">{{ projectName }}</span>
        </div>

        <div class="column is-2">
          <button
            class="button is-dark is-inverted is-outlined"
            :class="{ 'is-loading': loading === projectName }"
            @click="useProject({ projectName })"
            :disabled="!isCurrent(projectName)"
          >{{ isCurrent(projectName) ? 'Use' : 'In use' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';
  import naturalSort from '@/modv/utils/natural-sort';

  export default {
    name: 'projectGallery',
    data() {
      return {
        loading: null,

        nameError: false,
        nameErrorMessage: 'Preset must have a name',

        projectError: false,
        projectErrorMessage: 'Please select a project',

        newPresetName: '',
        newPresetProject: 'default',
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
      ...mapGetters('projects', [
        'allProjects',
      ]),
      ...mapGetters('modVModules', [
        'registry',
      ]),
      projects() {
        const data = {};

        Object.keys(this.allProjects).forEach((projectName) => {
          data[projectName] = [];

          Object.keys(this.allProjects[projectName].presets)
            .sort(naturalSort.compare)
            .forEach((presetName) => {
              data[projectName].push(this.allProjects[projectName].presets[presetName]);
            });
        });

        return data;
      },
    },
    methods: {
      ...mapActions('projects', [
        'loadPresetFromProject',
        'savePresetToProject',
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
      async loadPreset({ presetName, projectName }) {
        this.loading = `${projectName}.${presetName}`;

        await this.loadPresetFromProject({ presetName, projectName });
        this.loading = null;
      },
      async savePreset() {
        this.nameError = false;
        this.projectError = false;

        if (!this.newPresetName.trim().length) {
          this.nameError = true;
          return;
        }

        if (!this.newPresetProject.trim().length) {
          this.projectError = true;
          return;
        }

        await this.savePresetToProject({
          presetName: this.newPresetName,
          projectName: this.newPresetProject,
        });

        this.newPresetName = '';
      },
      isCurrent(projectName) {
        return this.$store.state.projects.currentProject !== projectName;
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
