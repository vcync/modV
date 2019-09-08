<template>
  <main id="app">
    <canvas
      ref="canvas"
      @dblclick="makeFullScreen"
      @mousemove="mouseMove"
      :style="{ cursor }"
    ></canvas>

    <section v-show="showUi">
      <CanvasDebugger />
      <Groups />
      <Gallery />
      <SizeDisplay />
      <div class="top-right">
        <FPSDisplay />
        <BPMDisplay />
      </div>
      <component
        :is="pluginComponent"
        v-for="pluginComponent in pluginComponents"
        :key="pluginComponent"
      ></component>
    </section>
  </main>
</template>

<script>
import SizeDisplay from "@/components/SizeDisplay";
import FPSDisplay from "@/components/FPSDisplay";
import BPMDisplay from "@/components/BPMDisplay";
import CanvasDebugger from "@/components/CanvasDebugger";
import Groups from "@/components/Groups";
import Gallery from "@/components/Gallery";

export default {
  name: "app",

  components: {
    SizeDisplay,
    FPSDisplay,
    BPMDisplay,
    CanvasDebugger,
    Groups,
    Gallery
  },

  data() {
    return {
      showUi: true,
      mouseTimer: null,
      cursor: "none"
    };
  },

  computed: {
    pluginComponents() {
      return this.$modV.store.state.plugins
        .filter(plugin => "component" in plugin)
        .map(plugin => plugin.component.name);
    }
  },

  async mounted() {
    await this.$modV.setup(this.$refs.canvas);
    window.addEventListener("resize", this.resize);

    this.$modV.$worker.addEventListener("message", e => {
      if (e.data.type === "outputs/SET_MAIN_OUTPUT") {
        this.resize();
      }
    });

    window.addEventListener("keypress", e => {
      // f
      if (e.keyCode === 102) {
        this.makeFullScreen();
      }

      // q
      if (e.keyCode === 113) {
        this.showUi = !this.showUi;
      }
    });
  },

  methods: {
    resize() {
      const { innerWidth: width, innerHeight: height } = window;
      this.$modV.setSize({ width, height });
    },

    makeFullScreen() {
      if (!document.body.ownerDocument.webkitFullscreenElement) {
        document.body.webkitRequestFullscreen();
      } else {
        document.body.ownerDocument.webkitExitFullscreen();
      }
    },

    mouseMove() {
      if (this.mouseTimer) {
        clearTimeout(this.mouseTimer);
      }

      this.cursor = "default";
      this.mouseTimer = setTimeout(this.movedMouse, 200);
    },

    movedMouse() {
      if (this.mouseTimer) {
        this.mouseTimer = null;
      }

      this.cursor = "none";
    }
  }
};
</script>

<style>
body,
#app {
  margin: 0;
  height: 100%;
  position: relative;
}
</style>

<style lang="scss" scoped>
canvas {
  position: fixed;
  left: 0;
  right: 0;
}

.top-right {
  position: fixed;
  top: 0;
  right: 0;
}
</style>
