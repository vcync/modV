<template>
  <div class="column control-panel is-6" :class="{ focused }">
    <article class="message">
      <div class="message-header">
        <p>{{ name }}</p>
        <button
          class="delete"
          :class="{ pinned }"
          :title="pinTitle"
          @click="pin"
        >
          <b-icon icon="thumb-tack" size="is-small" />
        </button>
      </div>
      <div v-bar="{ useScrollbarPseudo: true }" class="message-body">
        <div class="pure-form pure-form-aligned">
          <module-preset-selector
            class="pure-control-group"
            :presets="module.presets || {}"
            :module-name="name"
          />
          <component
            :is="control.component"
            v-for="control in controls"
            :key="control.meta.$modv_variable"
            class="pure-control-group"
            :module="module"
            :meta="control.meta"
          ></component>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import groupControl from '@/components/Controls/GroupControl'

import generateControlData from './generate-control-data'
import modulePresetSelector from './ModulePresetSelector'

export default {
  name: 'ControlPanel',
  components: {
    groupControl,
    modulePresetSelector
  },
  props: {
    moduleName: {
      type: String,
      default: undefined
    },
    pinned: {
      type: Boolean,
      default: false
    },
    focused: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('modVModules', ['getActiveModule']),
    module() {
      if (!this.moduleName) return false
      return this.$store.getters['modVModules/outerActive'][this.moduleName]
    },
    name() {
      if (!this.module) return ''
      return this.module.meta.name
    },
    controls() {
      return generateControlData({
        module: this.module
      })
    },
    pinTitle() {
      return this.pinned ? 'Unpin' : 'Pin'
    }
  },
  methods: {
    ...mapMutations('controlPanels', ['pinPanel', 'unpinPanel']),
    pin() {
      if (!this.pinned) {
        this.pinPanel({ moduleName: this.name })
      } else {
        this.unpinPanel({ moduleName: this.name })
      }
    }
  }
}
</script>

<style lang="scss"></style>
