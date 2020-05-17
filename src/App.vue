<template>
  <main id="app">
    <golden-layout class="hscreen" :showPopoutIcon="false" v-model="state">
      <gl-col>
        <gl-row>
          <gl-col :closable="false" :minItemWidth="100" id="lr-col">
            <gl-component title="Groups" :closable="false">
              <Groups />
            </gl-component>
          </gl-col>
          <gl-col :width="33" :closable="false" ref="rightColumn">
            <gl-stack title="Module Inspector">
              <gl-component title="hidden">
                <!-- hack around dynamic components not working correctly. CSS below hides tabs with the title "hidden" -->
              </gl-component>
              <gl-component
                v-for="module in focusedModules"
                :key="module.$id"
                :title="`${module.meta.name} properties`"
                :closable="false"
                ref="moduleInspector"
              >
                <grid v-if="module.props">
                  <c span="1..">
                    <button @click="toggleModulePin(module.$id)">
                      {{ isPinned(module.$id) ? "Unpin" : "Pin" }}
                    </button>
                  </c>
                  <c span="1..">
                    <Control
                      v-for="key in getProps(module.$moduleName)"
                      :id="module.$id"
                      :prop="key"
                      :key="key"
                    />
                  </c>
                </grid>
              </gl-component>
            </gl-stack>
          </gl-col>
        </gl-row>
        <gl-row>
          <gl-component title="Gallery" :closable="false">
            <Gallery />
          </gl-component>

          <gl-stack>
            <gl-component title="Input config" :closable="false">
              <InputConfig />
            </gl-component>

            <gl-stack title="Input Device Config" :closable="false">
              <gl-component title="Audio" :closable="false">
                <AudioDeviceConfig />
              </gl-component>
              <gl-component title="MIDI" :closable="false">
                <MIDIDeviceConfig />
              </gl-component>
              <gl-component title="BPM" :closable="false">
                <BPMConfig />
              </gl-component>
            </gl-stack>
          </gl-stack>

          <gl-stack>
            <gl-component title="Preview" :closable="false">
              <CanvasDebugger />
            </gl-component>

            <gl-component title="Swap" :closable="false">
              <ABSwap />
            </gl-component>
          </gl-stack>
        </gl-row>
      </gl-col>
    </golden-layout>

    <StatusBar />
  </main>
</template>

<script>
import CanvasDebugger from "@/components/CanvasDebugger";
import ABSwap from "@/components/ABSwap";
import Groups from "@/components/Groups";
import Gallery from "@/components/Gallery";
import InputConfig from "@/components/InputConfig";
import AudioDeviceConfig from "@/components/InputDeviceConfig/Audio.vue";
import MIDIDeviceConfig from "@/components/InputDeviceConfig/MIDI.vue";
import BPMConfig from "@/components/InputDeviceConfig/BPM.vue";
import StatusBar from "@/components/StatusBar";
import Control from "@/components/Control";

import "@/css/golden-layout_theme.css";

export default {
  name: "app",

  components: {
    // SizeDisplay,

    CanvasDebugger,
    ABSwap,
    Groups,
    Gallery,
    InputConfig,
    AudioDeviceConfig,
    MIDIDeviceConfig,
    BPMConfig,
    StatusBar,
    Control
  },

  data() {
    return {
      state: null,

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
    },

    focusedModules() {
      const focusedOrPinned = this.$store.getters["ui-modules/focusedOrPinned"];
      const modules = focusedOrPinned.map(
        id => this.$modV.store.state.modules.active[id]
      );

      return modules;
    },

    focusedActiveModule() {
      return this.$store.state["ui-modules"].focused;
    }
  },

  async mounted() {
    await this.$modV.setup();
    // this.$modV.$worker.addEventListener("message", e => {
    //   if (e.data.type === "outputs/SET_MAIN_OUTPUT") {
    //     this.resize();
    //   }
    // });

    // window.addEventListener("keypress", e => {
    //   // f
    //   if (e.keyCode === 102) {
    //     this.makeFullScreen();
    //   }

    //   // q
    //   if (e.keyCode === 113) {
    //     this.showUi = !this.showUi;
    //   }
    // });

    this.rightColumnWidth = window.innerWidth * 0.33;
  },

  methods: {
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
    },

    getProps(moduleName) {
      const moduleDefinition = this.$modV.store.state.modules.registered[
        moduleName
      ];

      return Object.keys(moduleDefinition.props).filter(
        key =>
          moduleDefinition.props[key].type === "int" ||
          moduleDefinition.props[key].type === "float" ||
          moduleDefinition.props[key].type === "text" ||
          moduleDefinition.props[key].type === "bool" ||
          moduleDefinition.props[key].type === "color" ||
          moduleDefinition.props[key].type === "vec2" ||
          moduleDefinition.props[key].type === "tween" ||
          moduleDefinition.props[key].type === "texture" ||
          moduleDefinition.props[key].type === "enum"
      );
    },

    toggleModulePin(id) {
      if (this.isPinned(id)) {
        this.$store.commit("ui-modules/REMOVE_PINNED", id);
      } else {
        this.$store.commit("ui-modules/ADD_PINNED", id);
      }
    },

    isPinned(id) {
      return this.$store.state["ui-modules"].pinned.indexOf(id) > -1;
    }
  },

  watch: {
    focusedActiveModule(inspectorId) {
      const index = this.$store.state["ui-modules"].pinned.findIndex(
        item => item === inspectorId
      );

      if (index > -1) {
        this.$refs.moduleInspector[index].focus();
      }
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=IBM+Plex+Mono:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i|IBM+Plex+Sans:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i&display=swap");
@import url("https://rsms.me/raster/raster.css?v=20");

:root {
  --fontSize: 14px;
  --foreground-color-rgb: 255, 255, 255;
  --foreground-color-a: 1;
  --background-color: #141416;
  --foreground-color-2: rgba(var(--foreground-color-rgb), 0.2);
  --foreground-color-3: rgba(var(--foreground-color-rgb), 0.1);
  --columnGap: calc(var(--lineHeight));
}

*::-webkit-scrollbar {
  width: 14px;
  height: 14px;
  background-color: var(--foreground-color-3); /* or add it to the track */
}

*::-webkit-scrollbar-thumb {
  background: var(--foreground-color-2);
}

* {
  box-sizing: border-box;
}

.lm_header .lm_tab {
  padding: 0 1em 5px;
  font-size: 1rem;
}

input,
textarea {
  background: var(--foreground-color-3);
  color: var(--foreground-color);
  border: none;
}

html,
body,
#app {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

body {
  margin: 0;
  padding: 0;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", "微軟雅黑", "Microsoft YaHei", "微軟正黑體",
    "Microsoft JhengHei", Verdana, Arial, sans-serif !important;

  /* font-family: "IBM Plex Mono"; */
}

.hscreen {
  width: 100vw;
  height: 100%;
}

html,
body,
#app {
  margin: 0;
  height: 100%;
  position: relative;
}

#app {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
}

.lm_header .lm_tab {
  margin-bottom: unset;
}

.lm_tab[title="hidden"] {
  display: none !important;
}
</style>

<style scoped>
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
