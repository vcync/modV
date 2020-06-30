<template>
  <div class="image-control" :data-moduleName="moduleName">
    <label :for="inputId">{{ label }}</label>

    <div class="columns is-variable is-2">
      <div class="column is-6">
        Source:
        <div v-for="sourceName in sources" :key="sourceName" class="field">
          <b-radio v-model="source" :native-value="sourceName">{{
            sourceName
          }}</b-radio>
        </div>
      </div>

      <div v-if="source === 'layer'" class="column is-6">
        <b-dropdown :id="inputId" v-model="currentLayerIndex" class="dropdown">
          <button slot="trigger" class="button is-primary is-small">
            <span>{{ selectedLabel | capitalize }}</span>
            <b-icon icon="angle-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="(data, idx) in layerNames"
            :key="idx"
            :value="data.value"
            >{{ data.label | capitalize }}</b-dropdown-item
          >
        </b-dropdown>
      </div>

      <div v-if="source === 'image'" class="column is-6">
        <b-dropdown :id="inputId" v-model="currentImage" class="dropdown">
          <button slot="trigger" class="button is-primary is-small">
            <span>{{ selectedLabel | capitalize }}</span>
            <b-icon icon="angle-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="(data, idx) in projectImages"
            :key="idx"
            :value="data.value"
            >{{ data.label | capitalize }}</b-dropdown-item
          >
        </b-dropdown>
      </div>

      <div v-if="source === 'video'" class="column is-6">
        <b-dropdown :id="inputId" v-model="currentVideo" class="dropdown">
          <button slot="trigger" class="button is-primary is-small">
            <span>{{ selectedLabel | capitalize }}</span>
            <b-icon icon="angle-down"></b-icon>
          </button>

          <b-dropdown-item
            v-for="(data, idx) in projectVideos"
            :key="idx"
            :value="data.value"
            >{{ data.label | capitalize }}</b-dropdown-item
          >
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ImageControl",
  props: ["meta"],
  data() {
    return {
      currentLayerIndex: -1,
      currentImage: "",
      currentVideo: "",
      source: "layer",
      sources: ["layer", "image", "video"]
    };
  },
  computed: {
    ...mapGetters("layers", {
      layers: "allLayers"
    }),

    layerNames() {
      const data = [];
      const allLayers = this.layers;

      if (allLayers.length < 1) return data;

      data.push({
        label: "Inherit",
        value: -1,
        selected: typeof this.currentLayerIndex === "undefined"
      });

      allLayers.forEach((Layer, idx) => {
        const name = Layer.name;
        data.push({
          label: name,
          value: idx,
          selected: this.currentLayerIndex === idx
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
        selected: images[title] === this.sourceData
      }));
    },

    projectVideos() {
      const { videos } = this.$store.state.projects.projects[
        this.$store.state.projects.currentProject
      ];

      return Object.keys(videos).map(title => ({
        label: title,
        value: videos[title],
        selected: videos[title] === this.sourceData
      }));
    },

    value: {
      get() {
        return this.$store.state.modVModules.active[this.moduleName][
          this.variable
        ];
      },
      set(value) {
        this.$store.dispatch("modVModules/updateProp", {
          name: this.moduleName,
          prop: this.variable,
          data: {
            source: this.source,
            sourceData: value
          }
        });
      }
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
      if (this.source === "layer") {
        return this.currentLayerIndex < 0
          ? "Inherit"
          : this.layers[this.currentLayerIndex].name;
      }

      if (this.source === "image") {
        const selectedImage = this.projectImages.find(
          image => image.value === this.sourceData
        );
        return (selectedImage && selectedImage.label) || "Select Image";
      }

      if (this.source === "video") {
        const selectedImage = this.projectVideos.find(
          video => video.value === this.sourceData
        );
        return (selectedImage && selectedImage.label) || "Select Video";
      }

      return "";
    }
  },
  watch: {
    currentLayerIndex(value, old) {
      if (value === old) return;
      this.currentImage = "";
      this.currentVideo = "";
      this.value = value;
    },
    currentImage(value) {
      if (!value.length) return;
      this.currentLayerIndex = -1;
      this.currentVideo = "";
      this.value = value;
    },
    currentVideo(value) {
      if (!value.length) return;
      this.currentLayerIndex = -1;
      this.currentImage = "";
      this.value = value;
    },
    value(value) {
      if (value.source) {
        this.source = value.source;
      }
    }
  },
  mounted() {
    if (this.value && this.value.sourceData) {
      this.currentLayerIndex = this.sourceData;
    }

    if (this.value && this.value.source) {
      this.source = this.value.source;
    }
  }
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
