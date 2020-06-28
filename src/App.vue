<template>
  <main id="app">
    <golden-layout
      class="hscreen"
      :showPopoutIcon="false"
      :state.sync="layoutState"
      @state="updateLayoutState"
    >
      <gl-col>
        <gl-row>
          <gl-col :closable="false" :minItemWidth="100" id="lr-col">
            <gl-stack title="Groups Stack">
              <gl-component title="Groups" :closable="false">
                <Groups />
              </gl-component>
            </gl-stack>
          </gl-col>
          <gl-col :width="33" :closable="false" ref="rightColumn">
            <gl-stack title="Module Inspector Stack">
              <gl-component title="hidden">
                <!-- hack around dynamic components not working correctly. CSS below hides tabs with the title "hidden" -->
              </gl-component>
              <gl-component
                v-for="module in focusedModules"
                :key="module.$id"
                :title="`${module.meta.name} properties`"
                :closable="false"
                ref="moduleInspector"
                :state="{ is: 'dynamic' }"
              >
                <ModuleInspector :moduleId="module.$id" />
              </gl-component>
            </gl-stack>
          </gl-col>
        </gl-row>
        <gl-row>
          <gl-component title="Info View" :closable="false">
            <InfoView />
          </gl-component>

          <gl-component title="Gallery" :closable="false">
            <Gallery />
          </gl-component>

          <gl-stack title="Input Stack">
            <gl-component title="Input config" :closable="false">
              <InputConfig />
            </gl-component>

            <gl-stack title="Input Device Config" :closable="false">
              <gl-component title="Audio/Video" :closable="false">
                <AudioVideoDeviceConfig />
              </gl-component>
              <gl-component title="MIDI" :closable="false">
                <MIDIDeviceConfig />
              </gl-component>
              <gl-component title="BPM" :closable="false">
                <BPMConfig />
              </gl-component>
              <gl-component title="NDI" :closable="false">
                <NDIConfig />
              </gl-component>
            </gl-stack>
          </gl-stack>

          <gl-stack title="Preview Stack">
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
    <Search />
  </main>
</template>

<script>
import CanvasDebugger from "@/components/CanvasDebugger";
import ABSwap from "@/components/ABSwap";
import Groups from "@/components/Groups";
import Gallery from "@/components/Gallery";
import InputConfig from "@/components/InputConfig";
import AudioVideoDeviceConfig from "@/components/InputDeviceConfig/AudioVideo.vue";
import MIDIDeviceConfig from "@/components/InputDeviceConfig/MIDI.vue";
import BPMConfig from "@/components/InputDeviceConfig/BPM.vue";
import NDIConfig from "@/components/InputDeviceConfig/NDI.vue";
import StatusBar from "@/components/StatusBar";
import ModuleInspector from "@/components/ModuleInspector";
import InfoView from "@/components/InfoView";
import Search from "@/components/Search";

import getNextName from "@/application/utils/get-next-name";
import constants from "@/application/constants";
import * as GoldenLayout from "golden-layout";

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
    AudioVideoDeviceConfig,
    MIDIDeviceConfig,
    BPMConfig,
    NDIConfig,
    StatusBar,
    InfoView,
    ModuleInspector,
    Search
  },

  data() {
    return {
      moduleInspectorIVTitle: "Module Inspector",
      moduleInspectorIVBody:
        "The properties of the selected Module. This panel can be pinned for easy access.",
      state: null,
      layoutState: null,

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

  created() {
    window.onerror = async message => {
      if (message === "Uncaught TypeError: next.getChild is not a function") {
        const localStorageKeys = Object.keys(window.localStorage);

        const nextKey = await getNextName(
          constants.LAYOUT_STATE_KEY,
          localStorageKeys
        );
        window.localStorage.setItem(nextKey, JSON.stringify(this.layoutState));

        window.localStorage.removeItem(constants.LAYOUT_STATE_KEY);

        window.localStorage.setItem(
          constants.LAYOUT_LOAD_ERROR_KEY,
          JSON.stringify(true)
        );
      }
    };

    const layoutErroredLastLoad = window.localStorage.getItem(
      constants.LAYOUT_LOAD_ERROR_KEY
    );

    if (layoutErroredLastLoad) {
      console.warn(
        "Layout could not be restored. Default layout loaded and old layout was saved to a backup local storage key"
      );
      window.localStorage.removeItem(constants.LAYOUT_LOAD_ERROR_KEY);
    }

    const layoutState = window.localStorage.getItem(constants.LAYOUT_STATE_KEY);
    if (layoutState) {
      this.layoutState = JSON.parse(layoutState);
    }
  },

  async mounted() {
    if (!this.$modV.ready) {
      await this.$modV.setup();
    }
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
    },

    /**
     * @description Traverses a Golden Layout state object to find GL Components
     * which have `componentState.is === "dynamic"` and removes them.
     *
     * If the containing GL Stack has no title, we can assume the dynamically
     * added component has been moved in the UI and the stack was created to
     * house the component, so we remove that too.
     *
     * We must remove these elements as GL's state must match the Vue virtual
     * DOM at time of mounting <golden-layout />. If we left these dynamically
     * created GL Components in the state, GL would not know what they are and
     * would error, resulting in the app not mounting and breaking.
     *
     * @param {GoldenLayout config}  config
     * @returns {GoldenLayout config}
     */
    purgeDynamicPanels(config) {
      if (Array.isArray(config.content)) {
        const itemsToSplice = [];

        const content = config.content;
        const childrenToSplice = [];
        for (let index = 0, len = content.length; index < len; index++) {
          const item = content[index];

          if (
            item.type === "component" &&
            item.componentState.is === "dynamic"
          ) {
            itemsToSplice.push(index);
          } else {
            if (this.purgeDynamicPanels(item) === true) {
              childrenToSplice.push(index);
            }
          }
        }

        // eslint-disable-next-line no-for-each/no-for-each
        childrenToSplice.forEach(index => {
          content.splice(index, 1);
          config.activeItemIndex = 0;
        });

        if (itemsToSplice.length > 0) {
          // eslint-disable-next-line no-for-each/no-for-each
          itemsToSplice.forEach(index => {
            config.content.splice(index, 1);
            config.activeItemIndex = 0;
          });

          if (config.title === "" && config.type === "stack") {
            return true;
          }
        }
      }

      return config;
    },

    /**
     * @description Called when <golden-layout /> updates its state.
     * Unminifies config, purges dynamically added panels, minifies and saves to
     * localStorage key `constants.LAYOUT_STATE_KEY`.
     *
     * @param {GoldenLayout config} value
     */
    updateLayoutState(configIn) {
      const config = GoldenLayout.unminifyConfig(configIn);
      const cleanedConfig = this.purgeDynamicPanels(config);

      window.localStorage.setItem(
        constants.LAYOUT_STATE_KEY,
        JSON.stringify(GoldenLayout.minifyConfig(cleanedConfig))
      );
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
  --foreground-color-1: rgba(var(--foreground-color-rgb), 0.5);
  --foreground-color-2: rgba(var(--foreground-color-rgb), 0.4);
  --foreground-color-3: rgba(var(--foreground-color-rgb), 0.2);
  --foreground-color-4: rgba(var(--foreground-color-rgb), 0.1);

  --background-color-rgb: 17, 17, 17;
  --background-color-a: 1;
  --background-color: rgba(
    var(--background-color-rgb),
    var(--background-color-a)
  );
  --background-color-1: rgba(var(--background-color-rgb), 0.8);
  --background-color-2: rgba(var(--background-color-rgb), 0.7);
  --background-color-3: rgba(var(--background-color-rgb), 0.5);
  --background-color-4: rgba(var(--background-color-rgb), 0.4);

  --columnGap: calc(var(--lineHeight));

  --focus-color-rgb: 241, 196, 16;
  --focus-color-a: 1;
  --focus-color: rgba(var(--focus-color-rgb), var(--focus-color-a));
}

*::-webkit-scrollbar {
  width: 14px;
  height: 14px;
  background-color: var(--foreground-color-3);
}

*::-webkit-scrollbar-thumb {
  background: var(--foreground-color-2);
}

* {
  box-sizing: border-box;
}

.hidden {
  display: none;
}

select {
  box-sizing: border-box;
  border: none;
  position: relative;
  display: inline-block;
  background-color: var(--foreground-color);
}

input[type="text"],
input[type="number"],
textarea,
select {
  padding: 0.3em 0.5em;
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
