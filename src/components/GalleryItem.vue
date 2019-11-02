<template>
  <div
    @mouseover="focus"
    @mouseleave="blur"
    @dblclick="doubleClick"
    v-if="!badModule"
    class="gallery-item"
  >
    <canvas ref="canvas"></canvas>
    <div class="title">{{ moduleName }}</div>
  </div>
</template>

<script>
export default {
  props: ["moduleName", "groupId"],

  data() {
    return {
      id: "",
      outputId: "",
      badModule: false
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
        height: height / 2
      },
      [offscreen]
    );

    const module = await this.$modV.store.dispatch("modules/makeActiveModule", {
      moduleName: this.moduleName,
      moduleMeta: { enabled: false, isGallery: true },
      skipInit: true
    });

    if (!module) {
      this.badModule = true;
      return;
    }

    this.id = module.id;
    this.outputId = outputContext.id;

    await this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
      moduleId: this.id,
      groupId: this.groupId
    });

    await this.$modV.store.dispatch("modules/init", {
      moduleId: this.id,
      width: width / 2,
      height: height / 2
    });

    await this.$modV.store.dispatch("modules/resize", {
      moduleId: this.id,
      width: width / 2,
      height: height / 2
    });
  },

  beforeDestroy() {
    this.$modV.store.commit("modules/REMOVE_ACTIVE_MODULE", this.id);
    this.$modV.store.commit("outputs/REMOVE_AUXILLARY", this.outputId);
    this.$modV.store.commit("groups/REMOVE_MODULE_FROM_GROUP", {
      groupId: this.groupId,
      moduleId: this.id
    });
  },

  methods: {
    focus() {
      this.$modV.store.commit("groups/UPDATE_GROUP", {
        groupId: this.groupId,
        data: {
          drawToCanvasId: this.outputId,
          enabled: true
        }
      });

      this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
        id: this.id,
        metaKey: "enabled",
        data: true
      });
    },

    blur() {
      this.$modV.store.commit("modules/UPDATE_ACTIVE_MODULE_META", {
        id: this.id,
        metaKey: "enabled",
        data: false
      });

      this.$modV.store.commit("groups/UPDATE_GROUP", {
        groupId: this.groupId,
        data: {
          enabled: false
        }
      });
    },

    async doubleClick() {
      const groupId = this.$store.state["ui-groups"].focused;
      if (!groupId) {
        return;
      }

      const module = await this.$modV.store.dispatch(
        "modules/makeActiveModule",
        { moduleName: this.moduleName }
      );

      this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
        moduleId: module.id,
        groupId,
        position: this.$modV.store.state.groups.groups.find(
          group => group.id === groupId
        ).modules.length
      });
    }
  }
};
</script>

<style>
canvas {
  max-width: 100%;
}

.gallery-item {
  background-color: #000;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  justify-self: center;
  align-self: flex-start;
  width: 100%;
  /* padding-bottom: 56.249999993%; */
  cursor: move;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  position: absolute;
}
</style>
