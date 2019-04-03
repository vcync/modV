<template>
  <div class="preset-gallery columns is-gapless is-multiline">
    <div class="column is-12">
      <div class="columns is-multiline">
        <div
          v-for="(plugin, pluginName) in plugins"
          :key="pluginName"
          class="column is-12"
        >
          <div class="columns">
            <div class="column is-8">
              <b-switch
                :value="plugin.enabled"
                class="has-text-light"
                @input="switchPlugin($event, { pluginName })"
              >
                {{ pluginName }}
              </b-switch>
            </div>
            <div
              v-if="'controlPanelComponent' in plugin.plugin && plugin.enabled"
              class="column is-4 has-text-right"
            >
              <button
                class="button"
                @click="collapsable[pluginName] = !collapsable[pluginName]"
              >
                {{ collapsable[pluginName] ? '▲' : '▼' }}
              </button>
            </div>
          </div>
          <b-collapse class="panel" :open.sync="collapsable[pluginName]">
            <div v-if="'controlPanelComponent' in plugin.plugin">
              <component
                :is="plugin.plugin.controlPanelComponent.name"
              ></component>

              <div v-if="plugin.plugin.pluginData" class="has-text-right">
                <button
                  class="button"
                  @click="savePluginSettings({ pluginName })"
                >
                  Save settings
                </button>
              </div>
            </div>
          </b-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PluginGallery',
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
      collapsable: {}
    }
  },
  computed: {
    ...mapGetters('plugins', ['plugins'])
  },
  created() {
    this.collapsable = Object.keys(this.plugins).reduce((acc, key) => {
      acc[key] = false
      return acc
    }, {})
  },
  methods: {
    ...mapActions('plugins', ['save', 'setEnabled']),
    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim()
      const term = termIn.toLowerCase().trim()
      if (termIn.length < 1) return true

      return text.indexOf(term) > -1
    },
    switchPlugin(e, { pluginName }) {
      this.setEnabled({ enabled: e, pluginName })
    },
    savePluginSettings({ pluginName }) {
      this.save({ pluginName })
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
