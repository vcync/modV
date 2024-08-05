<template>
  <grid columns="2">
    <c>
      <Select v-model="type" style="width: 100%">
        <option
          v-for="tt in textureTypes"
          :key="tt"
          :value="tt"
          :selected="type === tt"
        >
          {{ tt }}
        </option>
      </Select>
    </c>

    <c>
      <div v-if="type === 'group'">
        <Select
          v-model="modelCanvasId"
          style="width: 100%"
          @update:model-value="setTexture('group')"
        >
          <option
            v-for="group in groupOutputs"
            :key="group.id"
            :value="group.id"
          >
            {{ group.name }}
          </option>
        </Select>
      </div>

      <div v-if="type === 'canvas'">
        <Select
          v-model="modelCanvasId"
          style="width: 100%"
          @update:model-value="setTexture('canvas')"
        >
          <optgroup
            v-for="(outputs, group) in allOutputsByGroup"
            :key="group"
            :label="group"
          >
            <option
              v-for="output in outputs"
              :key="output.id"
              :value="output.id"
            >
              {{ output.name }}
            </option>
          </optgroup>
        </Select>
      </div>

      <div v-if="type === 'image'">
        <Select
          v-model="modelImagePath"
          :disabled="!images"
          style="width: 100%"
          @update:model-value="setTexture('image')"
        >
          <option selected value="">No image</option>
          <option
            v-for="(image, index) in images"
            :key="index"
            :value="image.path"
          >
            {{ image.name }}
          </option>
        </Select>
      </div>

      <div v-if="type === 'video'">
        <Select
          v-model="modelVideoPath"
          :disabled="!videos"
          style="width: 100%"
          @update:model-value="setTexture('video')"
        >
          <option selected value="">No video</option>
          <option
            v-for="output in videos"
            :key="output.path"
            :value="output.path"
          >
            {{ output.name }}
          </option>
        </Select>
      </div>
    </c>

    <c span="2">
      <VideoControl
        v-if="type === 'video' && modelVideoPath && modelValue.id"
        :video-id="modelValue.id"
        :paused="modelValue.options.paused ?? false"
        :playbackrate="modelValue.options.playbackrate ?? 1"
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
  components: {
    VideoControl,
  },
  props: {
    modelValue: { type: undefined },
  },
  emits: ["update:modelValue"],

  data() {
    return {
      textureTypes: ["inherit", "group", "canvas", "image", "video"],
      type: "",
      modelImagePath: "",
      modelVideoPath: "",
      modelCanvasId: "",
    };
  },

  computed: {
    auxillaries() {
      return this.$modV.store.state.outputs.auxillary;
    },

    groupOutputs() {
      return Object.values(this.auxillaries).filter(
        (auxillary) =>
          auxillary.group === "group" &&
          auxillary.name !== constants.GALLERY_GROUP_NAME,
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
    },
  },

  watch: {
    type(value) {
      this.setTexture(value);
    },
  },

  created() {
    this.type =
      this.modelValue?.type && this.modelValue?.type.length
        ? this.modelValue.type
        : this.textureTypes[0];
    this.modelImagePath =
      (this.modelValue?.type === "image" && this.modelValue?.options?.path) ||
      "";
    this.modelVideoPath =
      (this.modelValue?.type === "video" && this.modelValue?.options?.path) ||
      "";
    this.modelCanvasId = this.modelValue?.options?.id || "";
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
        if (this.modelVideoPath === this.modelValue?.options?.path) {
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

      this.$emit("update:modelValue", textureDefinition);
    },

    updateTextureDefinition(updatedValues) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        ...updatedValues,
      });
    },

    videoPause() {
      this.updateTextureDefinition({
        options: { ...this.modelValue.options, paused: true },
      });
    },

    videoPlay() {
      this.updateTextureDefinition({
        options: { ...this.modelValue.options, paused: false },
      });
    },

    videoRateChange(playbackrate) {
      this.updateTextureDefinition({
        options: { ...this.modelValue.options, playbackrate },
      });
    },
  },
};
</script>

<style scoped>
grid {
  width: 100%;
}
</style>
