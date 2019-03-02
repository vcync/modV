<template>
  <div class="image-control" :data-moduleName="moduleName">
    <label :for="inputId">{{ label }}</label>

    <div class="columns is-variable is-2">
      <div class="column is-6">Source:
        <div v-for="sourceName in sources" :key="sourceName" class="field">
          <b-radio v-model="source" :native-value="sourceName">{{ sourceName }}</b-radio>
        </div>
      </div>

      <div class="column is-6" v-if="source === 'layer'">
        <b-dropdown class="dropdown" v-model="currentLayerIndex" :id="inputId">
          <button class="button is-primary is-small" slot="trigger">
            <span>{{ selectedLabel | capitalize }}</span>
            <b-icon icon="angle-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="(data, idx) in layerNames"
            :key="idx"
            :value="data.value"
          >{{ data.label | capitalize }}</b-dropdown-item>
        </b-dropdown>
      </div>

      <div class="column is-6" v-if="source === 'image'">
        <b-dropdown class="dropdown" v-model="currentImage" :id="inputId">
          <button class="button is-primary is-small" slot="trigger">
            <span>{{ selectedLabel | capitalize }}</span>
            <b-icon icon="angle-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="(data, idx) in projectImages"
            :key="idx"
            :value="data.value"
          >{{ data.label | capitalize }}</b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'imageControl',
  props: ['meta'],
  data() {
    return {
      currentLayerIndex: -1,
      currentImage: '',
      source: 'layer',
      sources: ['layer', 'image', 'video'],
    };
  },
  computed: {
    ...mapGetters('layers', {
      layers: 'allLayers',
    }),

    layerNames() {
      const data = [];
      const allLayers = this.layers;

      if (allLayers.length < 1) return data;

      data.push({
        label: 'Inherit',
        value: -1,
        selected: typeof this.currentLayerIndex === 'undefined',
      });

      allLayers.forEach((Layer, idx) => {
        const name = Layer.name;
        data.push({
          label: name,
          value: idx,
          selected: this.currentLayerIndex === idx,
        });
      });

      return data;
    },

    projectImages() {
      const { images } = this.$store.state.projects.projects[
        this.$store.state.projects.currentProject
      ];

      return Object.keys(images).map(title => ({
        label: title,
        value: images[title],
        selected: images[title] === this.sourceData,
      }));
    },

    value: {
      get() {
        return this.$store.state.modVModules.active[this.moduleName][this.variable];
      },
      set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: {
            source: this.source,
            sourceData: value,
          },
        });
      },
    },

    sourceData() {
      return this.value && this.value.sourceData;
    },

    variable() {
      return this.meta.$modv_variable;
    },

    label() {
      return this.meta.label || this.variable;
    },

    moduleName() {
      return this.meta.$modv_moduleName;
    },

    currentLayer() {
      return this.layers[this.currentLayerIndex];
    },

    inputId() {
      return `${this.moduleName}-${this.variable}`;
    },

    selectedLabel() {
      if (this.source === 'layer') {
        return this.currentLayerIndex < 0 ? 'Inherit' : this.layers[this.currentLayerIndex].name;
      }

      if (this.source === 'image') {
        const selectedImage = this.projectImages.find(image => image.value === this.sourceData);
        return (selectedImage && selectedImage.label) || 'Select Image';
      }

      return '';
    },
  },
  mounted() {
    if (this.value && this.value.sourceData) {
      this.currentLayerIndex = this.sourceData;
    }

    if (this.value && this.value.source) {
      this.source = this.value.source;
    }
  },
  watch: {
    currentLayerIndex(value) {
      this.value = value;
    },
    currentImage(value) {
      this.value = value;
    },
    value(value) {
      if (value.source) {
        this.source = value.source;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-selector-container {
  display: inline-block;
}

.profile-selector.hsy-dropdown {
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
