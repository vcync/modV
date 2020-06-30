<template>
  <b-dropdown v-model="currentProject" class="dropdown">
    <button slot="trigger" class="button is-primary is-small">
      <span>{{ currentProject }}</span>
      <b-icon icon="angle-down"></b-icon>
    </button>

    <b-dropdown-item
      v-for="(name, idx) in projectNames"
      :key="idx"
      :value="name.value"
      >{{ name.label }}</b-dropdown-item
    >
  </b-dropdown>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ProjectSelector",
  props: ["value"],
  data() {
    return {
      currentProject: "default"
    };
  },
  computed: {
    ...mapGetters("projects", ["allProjects"]),
    projectNames() {
      const data = [];
      const allProjects = this.allProjects;

      Object.keys(allProjects).forEach(projectName => {
        data.push({
          label: projectName,
          value: projectName,
          selected: this.currentProject === projectName
        });
      });

      return data;
    }
  },
  watch: {
    currentProject() {
      this.$emit("input", this.currentProject);
    }
  }
};
</script>

<style lang="scss">
.project-selector-container {
  display: inline-block;
}

.project-selector.hsy-dropdown {
  display: inline-block;
  vertical-align: middle;

  & > .selected {
    // height: 28px !important;
    // line-height: 28px !important;

    font-family: inherit;
    /* font-size: 100%; */
    padding: 0.5em 22px 0.5em 1em;
    color: #444;
    color: rgba(0, 0, 0, 0.8);
    border: 1px solid #999;
    border: 0 rgba(0, 0, 0, 0);
    background-color: #e6e6e6;
    text-decoration: none;
    border-radius: 2px;
  }
}
</style>
