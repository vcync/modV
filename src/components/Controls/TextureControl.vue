<template>
  <grid columns="2">
    <c>
      <Select v-model="type" style="width: 100%">
        <option
          v-for="tt in textureTypes"
          :value="tt"
          :key="tt"
          :selected="type === tt"
          >{{ tt }}</option
        >
      </Select>
    </c>

    <c>
      <div v-if="type === 'group'">
        <Select
          v-model="modelCanvasId"
          @input="setTexture('group')"
          style="width: 100%"
        >
          <option
            v-for="group in groupOutputs"
            :value="group.id"
            :key="group.id"
          >
            {{ group.name }}
          </option>
        </Select>
      </div>

      <div v-if="type === 'canvas'">
        <Select
          v-model="modelCanvasId"
          @input="setTexture('canvas')"
          style="width: 100%"
        >
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
        </Select>
      </div>

      <div v-if="type === 'image'">
        <Select
          v-model="modelImagePath"
          @input="setTexture('image')"
          :disabled="!images"
          style="width: 100%"
        >
          <option selected value="">No image</option>
          <option
            v-for="(image, index) in images"
            :key="index"
            :value="image.path"
            >{{ image.name }}</option
          >
        </Select>
      </div>

      <div v-if="type === 'video'">
        <Select
          v-model="modelVideoPath"
          @input="setTexture('video')"
          :disabled="!videos"
          style="width: 100%"
        >
          <option selected value="">No video</option>
          <option
            v-for="output in videos"
            :key="output.path"
            :value="output.path"
            >{{ output.name }}</option
          >
        </Select>
      </div>
    </c>

    <c span="2">
      <VideoControl
        v-if="type === 'video' && modelVideoPath && value.id"
        :video-id="value.id"
        :paused="value.options.paused ?? false"
        :playbackrate="value.options.playbackrate ?? 1"
        @pause="videoPause"
        @play="videoPlay"
        @ratechange="videoRateChange"
      />
    </c>
  </grid>
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
    this.modelImagePath =
      (this.value.type === "image" && this.value.options?.path) || "";
    this.modelVideoPath =
      (this.value.type === "video" && this.value.options?.path) || "";
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
        if (this.modelVideoPath === this.value?.options?.path) {
          return;
        }

        textureDefinition.options.paused = false;
        textureDefinition.options.playbackrate = 1;
        textureDefinition.options.path = this.modelVideoPath;
      }

      if (type === "canvas" || type === "group") {
        if (!this.modelCanvasId) {
          return;
        }

        textureDefinition.options.id = this.modelCanvasId;
      }

      this.$emit("input", textureDefinition);
    },

    updateTextureDefinition(updatedValues) {
      this.$emit("input", {
        ...this.value,
        ...updatedValues
      });
    },

    videoPause() {
      this.updateTextureDefinition({
        options: { ...this.value.options, paused: true }
      });
    },

    videoPlay() {
      this.updateTextureDefinition({
        options: { ...this.value.options, paused: false }
      });
    },

    videoRateChange(playbackrate) {
      this.updateTextureDefinition({
        options: { ...this.value.options, playbackrate }
      });
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
