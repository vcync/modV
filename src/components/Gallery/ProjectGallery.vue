<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <div class="columns">
        <div class="column is-2 flex-center">Create new:</div>
        <div class="column is-8">
          <b-input v-model="newProjectName" placeholder="Project name" />
        </div>
        <div class="column is-2">
          <button class="button is-light" @click="newProject">Create</button>
        </div>
      </div>
    </div>

    <div
      v-for="projectName in projects"
      :key="projectName"
      class="column is-12 preset-container"
    >
      <div class="columns">
        <div class="column is-10">
          <span class="has-text-light">{{ projectName }}</span>
        </div>

        <div class="column is-2">
          <button
            class="button is-dark is-inverted is-outlined"
            :disabled="!isCurrent(projectName)"
            @click="useProject({ projectName })"
          >
            {{ isCurrent(projectName) ? "Use" : "In use" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import naturalSort from "@/modv/utils/natural-sort";
import { modV } from "@/modv";

export default {
  name: "ProjectGallery",
  props: {
    phrase: {
      type: String,
      required: true,
      default: ""
    }
  },
  data() {
    return {
      newProjectName: "",

      nameError: false,
      nameErrorMessage: "Project must have a name"
    };
  },
  computed: {
    allProjects() {
      return this.$store.state.projects.projects;
    },
    projects() {
      return Object.keys(this.allProjects).sort(naturalSort.compare);
    }
  },
  methods: {
    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim();
      const term = termIn.toLowerCase().trim();
      if (termIn.length < 1) return true;

      return text.indexOf(term) > -1;
    },
    useProject({ projectName }) {
      this.$store.dispatch("projects/setCurrent", { projectName });
    },
    isCurrent(projectName) {
      return this.$store.state.projects.currentProject !== projectName;
    },
    newProject() {
      const MediaManager = modV.MediaManagerClient;

      MediaManager.send({
        request: "make-profile",
        profileName: this.newProjectName
      });
    }
  }
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

.flex-center {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
