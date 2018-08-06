<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div
      v-for="projectName in projects"
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
            :disabled="!isCurrent(projectName)"
            @click="useProject({ projectName })"
          >{{ isCurrent(projectName) ? 'Use' : 'In use' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import naturalSort from '@/modv/utils/natural-sort';

  export default {
    name: 'projectGallery',
    data() {
      return {
        loading: null,

        nameError: false,
        nameErrorMessage: 'Project must have a name',
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
      allProjects() {
        return this.$store.state.projects.projects;
      },
      projects() {
        return Object.keys(this.allProjects).sort(naturalSort.compare);
      },
    },
    methods: {
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
      },
      useProject({ projectName }) {
        this.$store.dispatch('projects/setCurrent', { projectName });
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
