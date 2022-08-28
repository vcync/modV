<template>
  <div>
    <select v-model="type">
      <option
        v-for="tt in textureTypes"
        :value="tt"
        :key="tt"
        :selected="type === tt"
        >{{ tt }}</option
      >
    </select>

    <div v-if="type === 'group'">
      <select v-model="modelCanvasId" @change="setTexture('group')">
        <option v-for="group in groupOutputs" :value="group.id" :key="group.id">
          {{ group.name }}
        </option>
      </select>
    </div>

    <div v-if="type === 'canvas'">
      <select v-model="modelCanvasId" @change="setTexture('canvas')">
        <optgroup
          v-for="(outputs, group) in allOutputsByGroup"
          :label="group"
          :key="group"
        >
          <option
            v-for="output in outputs"
            :key="output.id"
            :value="output.id"
            >{{ output.name }}</option
          >
        </optgroup>
      </select>
    </div>

    <div v-if="type === 'image'">
      <select
        v-model="modelImagePath"
        @change="setTexture('image')"
        :disabled="!images"
      >
        <option selected value="">No image</option>
        <option
          v-for="(image, index) in images"
          :key="index"
          :value="image.path"
          >{{ image.name }}</option
        >
      </select>
    </div>

    <div v-if="type === 'video'">
      <select
        v-model="modelVideoPath"
        @change="setTexture('video')"
        :disabled="!videos"
      >
        <option selected value="">No video</option>
        <option
          v-for="output in videos"
          :key="output.path"
          :value="output.path"
          >{{ output.name }}</option
        >
      </select>

      <VideoControl
        v-if="type === 'video' && modelVideoPath && value.id"
        :video-id="value.id"
      />
    </div>
  </div>
</template>

<script>
import constants from "../../application/constants";
import { VideoControl } from "./VideoControl.vue";

export default {
  props: ["value"],

  components: {
    VideoControl
  },

  data() {
    return {
      textureTypes: ["inherit", "group", "canvas", "image", "video"],
      type: "",
      modelImagePath: "",
      modelVideoPath: "",
      modelCanvasId: ""
    };
  },

  created() {
    this.type =
      this.value.type && this.value.type.length
        ? this.value.type
        : this.textureTypes[0];
    this.modelImagePath = this.value.options?.path || "";
    this.modelCanvasId = this.value.options?.id || "";
  },

  computed: {
    auxillaries() {
      return this.$modV.store.state.outputs.auxillary;
    },

    groupOutputs() {
      return Object.values(this.auxillaries).filter(
        auxillary =>
          auxillary.group === "group" &&
          auxillary.name !== constants.GALLERY_GROUP_NAME
      );
    },

    allOutputsByGroup() {
      const groups = {};
      const auxValues = Object.values(this.auxillaries);
      for (let i = 0, len = auxValues.length; i < len; i++) {
        const aux = auxValues[i];

        if (!groups[aux.group]) {
          groups[aux.group] = {};
        }

        groups[aux.group][aux.id] = aux;
      }

      return groups;
    },

    images() {
      return (
        this.$modV.store.state.media.media[
          this.$modV.store.state.projects.currentProject
        ].image ?? false
      );
    },

    videos() {
      return (
        this.$modV.store.state.media.media[
          this.$modV.store.state.projects.currentProject
        ].video ?? false
      );
    }
  },

  methods: {
    setTexture(type) {
      const textureDefinition = { type, options: {} };
      if (type === "image") {
        if (!this.modelImagePath) {
          return;
        }

        textureDefinition.options.path = this.modelImagePath;
      }

      if (type === "video") {
        if (!this.modelVideoPath) {
          return;
        }

        textureDefinition.options.path = this.modelVideoPath;
      }

      if (type === "canvas" || type === "group") {
        if (!this.modelCanvasId) {
          return;
        }

        textureDefinition.options.id = this.modelCanvasId;
      }

      this.$emit("input", textureDefinition);
    }
  },

  watch: {
    type(value) {
      this.setTexture(value);
    }
  }
};
</script>

<style scoped></style>
