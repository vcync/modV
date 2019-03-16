<template>
  <div>
    <span class="tag" @dblclick="modalOpen = true">{{
      $store.state.projects.currentProject
    }}</span>

    <b-modal :active.sync="modalOpen">
      <div class="card">
        <div class="card-content">
          <h1 class="title">Projects</h1>
          <div class="columns is-mobile is-multiline">
            <div
              v-for="projectName in Object.keys($store.state.projects.projects)"
              :key="projectName"
              class="column is-12"
            >
              <div class="columns">
                <div class="column is-10">
                  {{ projectName }}
                </div>
                <div class="column is-2">
                  <button
                    class="button is-dark is-outlined"
                    :disabled="!isCurrent(projectName)"
                    @click="useProject({ projectName })"
                  >
                    {{ isCurrent(projectName) ? 'Use' : 'In use' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'StatusBarItemProject',
  data() {
    return {
      modalOpen: false
    }
  },
  methods: {
    useProject({ projectName }) {
      this.$store.dispatch('projects/setCurrent', { projectName })
    },
    isCurrent(projectName) {
      return this.$store.state.projects.currentProject !== projectName
    }
  }
}
</script>
