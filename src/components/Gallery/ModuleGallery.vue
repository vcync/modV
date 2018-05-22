<template>
  <div class="module-gallery columns is-multiline">
    <div class="column is-12 title" :class="{ hidden: phrase.length < 1 }">
      <h2>All Modules</h2>
    </div>
    <div class="column is-12" :class="{ hidden: phrase.length < 1 }">
      <draggable
        class="columns is-multiline is-mobile is-variable is-1"
        :options="{
          group: {
            name: 'modules',
            pull: 'clone',
            put: false,
          },
          sort: false,
        }"
      >
        <div
          class="column is-3"
          v-for="(module, key) in modules"
          :key="key"
          :data-module-name="key"
          :class="{ hidden: !search(key, phrase) }"
        >
          <gallery-item
            :module-in="module"
            :module-name="key"
          ></gallery-item>
        </div>
      </draggable>
    </div>

    <div class="column is-12 title" :class="{ hidden: phrase.length > 0 }">
      <h2>Module 2D</h2>
    </div>
    <div class="column is-12">
      <draggable
        class="columns is-multiline is-mobile is-variable is-1"
        :class="{ hidden: phrase.length > 0 }"
        :options="{
          group: {
            name: 'modules',
            pull: 'clone',
            put: false,
          },
          sort: false,
        }"
      >
        <div
          class="column is-3"
          v-for="(module, key) in module2d"
          :key="key"
          :data-module-name="key"
        >
          <gallery-item
            :module-in="module"
            :module-name="key"
          ></gallery-item>
        </div>
      </draggable>
    </div>

    <div class="column is-12 title" :class="{ hidden: phrase.length > 0 }">
      <h2>Module Shader</h2>
    </div>
    <div class="column is-12">
      <draggable
        class="columns is-multiline is-mobile is-variable is-1"
        :class="{ hidden: phrase.length > 0 }"
        :options="{
          group: {
            name: 'modules',
            pull: 'clone',
            put: false,
          },
          sort: false,
        }"
      >
        <div
          class="column is-3"
          v-for="(module, key) in moduleShader"
          :key="key"
          :data-module-name="key"
        >
          <gallery-item
            :module-in="module"
            :module-name="key"
          ></gallery-item>
        </div>
      </draggable>
    </div>

    <div class="column is-12 title" :class="{ hidden: phrase.length > 0 }">
      <h2>Module ISF</h2>
    </div>
    <div class="column is-12">
      <draggable
        class="columns is-multiline is-mobile is-variable is-1"
        :class="{ hidden: phrase.length > 0 }"
        :options="{
          group: {
            name: 'modules',
            pull: 'clone',
            put: false,
          },
          sort: false,
        }"
      >
        <div
          class="column is-3"
          v-for="(module, key) in moduleIsf"
          :key="key"
          :data-module-name="key"
        >
          <gallery-item
            :module-in="module"
            :module-name="key"
          ></gallery-item>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import draggable from 'vuedraggable';

  import { Module2D, ModuleShader, ModuleISF } from '@/modv';

  import GalleryItem from '@/components/GalleryItem';

  export default {
    name: 'moduleGallery',
    components: {
      draggable,
      GalleryItem,
    },
    props: {
      phrase: {
        type: String,
        required: true,
        default: '',
      },
    },
    computed: {
      ...mapGetters('modVModules', {
        currentDragged: 'currentDragged',
        modules: 'registry',
      }),
      moduleShader() {
        return Object.keys(this.modules)
          .filter(key => this.modules[key].prototype instanceof ModuleShader)
          .reduce((result, key) => {
            result[key] = this.modules[key];
            return result;
          }, {});
      },
      module2d() {
        return Object.keys(this.modules)
          .filter(key => this.modules[key].prototype instanceof Module2D)
          .reduce((result, key) => {
            result[key] = this.modules[key];
            return result;
          }, {});
      },
      moduleIsf() {
        return Object.keys(this.modules)
          .filter(key => this.modules[key].prototype instanceof ModuleISF)
          .reduce((result, key) => {
            result[key] = this.modules[key];
            return result;
          }, {});
      },
    },
    methods: {
      search(textIn, termIn) {
        const text = textIn.toLowerCase().trim();
        const term = termIn.toLowerCase().trim();
        if (termIn.length < 1) return true;

        return text.indexOf(term) > -1;
      },
    },
  };
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
