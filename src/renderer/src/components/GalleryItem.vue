<template>
  <div
    v-if="!badModule"
    v-contextMenu="() => GalleryItemContextMenu({ moduleName })"
    class="gallery-item"
    :class="{ grabbing }"
    @mouseover="focus"
    @mouseleave="blur"
    @dblclick="doubleClick"
    @mousedown="mouseDown"
  >
    <canvas ref="canvas"></canvas>
    <div class="title">{{ moduleName }}</div>
  </div>
</template>

<script>
import { GROUP_ENABLED, GROUP_DISABLED } from "../application/constants.js";
import { GalleryItemContextMenu } from "../menus/context/galleryItemContextMenu";

export default {
  props: {
    moduleName: { type: String },
    groupId: { type: String },
  },

  data() {
    return {
      id: "",
      outputId: "",
      activeModule: { meta: {} },
      badModule: false,
      grabbing: false,
      GalleryItemContextMenu,
    };
  },

  async mounted() {
    const { canvas } = this.$refs;
    const { width, height } = canvas;
    const offscreen = canvas.transferControlToOffscreen();

    const outputContext = await this.$modV.store.dispatch(
      "outputs/getAuxillaryOutput",
      {
        name: `${this.moduleName}-gallery`,
        canvas: offscreen,
        type: "2d",
        group: "gallery",
        reactToResize: false,
        width: width / 2,
        height: height / 2,
      },
      [offscreen],
    );

    const module = await this.$modV.store.dispatch("modules/makeActiveModule", {
      moduleName: this.moduleName,
      moduleMeta: { enabled: false, isGallery: true },
      skipInit: true,
    });

    if (!module) {
      this.badModule = true;
      return;
    }

    this.activeModule = module;
    this.id = module.$id;
    this.outputId = outputContext.id;

    await this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
      moduleId: this.id,
      groupId: this.groupId,
    });

    await this.$modV.store.dispatch("modules/init", {
      moduleId: this.id,
      width: width / 2,
      height: height / 2,
    });

    await this.$modV.store.dispatch("modules/resize", {
      moduleId: this.id,
      width: width / 2,
      height: height / 2,
    });

    // Synthesise a resize event for smooth-dnd's buggy hit detection to work
    window.dispatchEvent(new Event("resize"));
  },

  async beforeUnmount() {
    await this.$modV.store.dispatch("modules/removeActiveModule", {
      moduleId: this.id,
    });

    this.$modV.store.commit("outputs/REMOVE_AUXILLARY", this.outputId);
    this.$modV.store.commit("groups/REMOVE_MODULE_FROM_GROUP", {
      groupId: this.groupId,
      moduleId: this.id,
    });

    // ensure listener cleanup
    this.mouseUp();
  },

  methods: {
    focus() {
      this.$modV.store.commit("groups/UPDATE_GROUP", {
        groupId: this.groupId,
        data: {
          drawToCanvasId: this.outputId,
          enabled: GROUP_ENABLED,
        },
      });

      this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
        id: this.id,
        metaKey: "enabled",
        data: true,
      });
    },

    blur() {
      this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
        id: this.id,
        metaKey: "enabled",
        data: false,
      });

      this.$modV.store.commit("groups/UPDATE_GROUP", {
        groupId: this.groupId,
        data: {
          enabled: GROUP_DISABLED,
        },
      });
    },

    async doubleClick() {
      const groupId = this.$store.state["uiGroups"].lastFocused;
      if (!groupId) {
        return;
      }

      const module = await this.$modV.store.dispatch(
        "modules/makeActiveModule",
        { moduleName: this.moduleName },
      );

      this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
        moduleId: module.$id,
        groupId,
        position: this.$modV.store.state.groups.groups.find(
          (group) => group.id === groupId,
        ).modules.length,
      });
    },

    mouseDown() {
      this.grabbing = true;
      window.addEventListener("mouseup", this.mouseUp);
    },

    mouseUp() {
      this.grabbing = false;
      window.removeEventListener("mouseup", this.mouseUp);
    },
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
}

.gallery-item {
  position: relative;
  cursor: grab;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.gallery-item.grabbing {
  cursor: grabbing;
}

.gallery-item:hover canvas {
  opacity: 1;
}

.gallery-item:hover.title {
  opacity: 0.3;
}

.gallery-item canvas {
  opacity: 0.3;
  transition: 150ms opacity;
  width: 100%;
  height: 100%;
}

.gallery-item .title {
  transition: 150ms opacity;
  padding: 0.45em;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
  overflow: hidden;
}

.title {
  position: absolute;
}
</style>
