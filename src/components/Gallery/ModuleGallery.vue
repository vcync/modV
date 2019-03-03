<template>
  <div class="module-gallery columns is-multiline">
    <div v-show="phrase.length > 0" class="column is-12 title">
      <h2>All Modules</h2>
    </div>
    <div v-show="phrase.length > 0" class="column is-12">
      <Container
        behaviour="copy"
        group-name="modules"
        :get-child-payload="e => getChildPayload('modules', e)"
        tag="div"
        class="columns is-multiline is-mobile is-variable is-1"
      >
        <Draggable
          v-for="(module, key) in modules"
          :key="key"
          class="column is-3"
          :class="{ hidden: !search(key, phrase) }"
        >
          <gallery-item
            v-once
            :module-in="module"
            :module-name="key"
          ></gallery-item>
        </Draggable>
      </Container>
    </div>

    <div v-show="phrase.length < 1" class="column is-12 title">
      <h2>Module 2D</h2>
    </div>
    <div v-show="phrase.length < 1" class="column is-12">
      <Container
        behaviour="copy"
        group-name="modules"
        :get-child-payload="e => getChildPayload('module2d', e)"
        tag="div"
        class="columns is-multiline is-mobile is-variable is-1"
      >
        <Draggable
          v-for="moduleName in module2d"
          :key="moduleName"
          class="column is-3"
        >
          <gallery-item v-once :module-name="moduleName"></gallery-item>
        </Draggable>
      </Container>
    </div>

    <div v-show="phrase.length < 1" class="column is-12 title">
      <h2>Module Shader</h2>
    </div>
    <div v-show="phrase.length < 1" class="column is-12">
      <Container
        behaviour="copy"
        group-name="modules"
        :get-child-payload="e => getChildPayload('moduleShader', e)"
        tag="div"
        class="columns is-multiline is-mobile is-variable is-1"
      >
        <Draggable
          v-for="moduleName in moduleShader"
          :key="moduleName"
          class="column is-3"
        >
          <gallery-item v-once :module-name="moduleName"></gallery-item>
        </Draggable>
      </Container>
    </div>

    <div v-show="phrase.length < 1" class="column is-12 title">
      <h2>Module ISF</h2>
    </div>
    <div v-show="phrase.length < 1" class="column is-12">
      <Container
        behaviour="copy"
        group-name="modules"
        :get-child-payload="e => getChildPayload('moduleIsf', e)"
        tag="div"
        class="columns is-multiline is-mobile is-variable is-1"
      >
        <Draggable
          v-for="moduleName in moduleIsf"
          :key="moduleName"
          class="column is-3"
        >
          <gallery-item v-once :module-name="moduleName"></gallery-item>
        </Draggable>
      </Container>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Container, Draggable } from 'vue-smooth-dnd'

import GalleryItem from '@/components/GalleryItem'

export default {
  name: 'ModuleGallery',
  components: {
    GalleryItem,
    Container,
    Draggable
  },
  props: {
    phrase: {
      type: String,
      required: true,
      default: ''
    }
  },
  computed: {
    ...mapGetters('modVModules', {
      currentDragged: 'currentDragged',
      modules: 'registry'
    }),
    moduleShader() {
      return Object.keys(this.modules).filter(
        key => this.modules[key].meta.type === 'shader'
      )
    },
    module2d() {
      return Object.keys(this.modules).filter(
        key => this.modules[key].meta.type === '2d'
      )
    },
    moduleIsf() {
      return Object.keys(this.modules).filter(
        key => this.modules[key].meta.type === 'isf'
      )
    }
  },
  methods: {
    search(textIn, termIn) {
      const text = textIn.toLowerCase().trim()
      const term = termIn.toLowerCase().trim()
      if (termIn.length < 1) return true

      return text.indexOf(term) > -1
    },
    getChildPayload(group, index) {
      let moduleName = this[group][index]

      if (group === 'modules') {
        moduleName = Object.keys(this.modules)[index]
      }

      return { moduleName, collection: 'gallery' }
    }
  }
}
</script>

<style lang="scss" scoped>
.hidden {
  display: none !important;
}

.title h2 {
  color: #fff;
  cursor: default;
  font-weight: normal;
  margin: 0.82em 5pt 0.2em 5pt;
}
</style>
