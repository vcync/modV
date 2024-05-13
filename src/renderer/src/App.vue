<template>
  <main id="app">
    <golden-layout
      :key="triggerUiRestart"
      class="hscreen"
      :router="false"
      :config="layoutConfig"
      @state="updateLayoutState"
    >
      <template #groups>
        <Groups />
      </template>

      <template #module-inspector>
        <div
          v-for="(module, i) in focusedModules"
          :key="i"
          ref="moduleInspector"
          :title="`${module.meta.name} properties`"
          :closable="false"
          :state="{ is: 'dynamic' }"
        >
          <ModuleInspector :module-id="module.$id" />
        </div>
      </template>

      <template #info-view>
        <InfoView />
      </template>

      <template #gallery>
        <Gallery />
      </template>

      <template #input-config>
        <InputConfig />
      </template>

      <template #avd-config>
        <AudioVideoDeviceConfig />
      </template>

      <template #md-config>
        <MIDIDeviceConfig />
      </template>

      <template #bpm-config>
        <BPMConfig />
      </template>

      <template #ndi-config>
        <NDIConfig />
      </template>

      <template #plugins>
        <Plugins />
      </template>

      <template #preview>
        <Preview />
      </template>
    </golden-layout>

    <StatusBar />
    <Search />
    <FrameRateDialog />
    <ErrorWatcher />
  </main>
</template>

<script>
import Preview from "./components/Preview.vue";
import Groups from "./components/Groups.vue";
import Gallery from "./components/Gallery.vue";
import InputConfig from "./components/InputConfig.vue";
import AudioVideoDeviceConfig from "./components/InputDeviceConfig/AudioVideo.vue";
import MIDIDeviceConfig from "./components/InputDeviceConfig/MIDI.vue";
import BPMConfig from "./components/InputDeviceConfig/BPM.vue";
import NDIConfig from "./components/InputDeviceConfig/NDI.vue";
import StatusBar from "./components/StatusBar/index.vue";
import ModuleInspector from "./components/ModuleInspector.vue";
import InfoView from "./components/InfoView.vue";
import Search from "./components/Search.vue";
import FrameRateDialog from "./components/dialogs/FrameRateDialog.vue";
import ErrorWatcher from "./components/ErrorWatcher.vue";
import Plugins from "./components/Plugins.vue";

import getNextName from "./application/utils/get-next-name.js";
import constants from "./application/constants.js";

import { GoldenLayout as GLComponent } from "./v3-gl-ext.es";
import * as GoldenLayout from "golden-layout";
import "golden-layout/dist/css/goldenlayout-base.css";
const { ipcRenderer } = window.electron;

const { ItemType } = GoldenLayout;

export default {
  name: "App",

  components: {
    Preview,
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
    Search,
    FrameRateDialog,
    ErrorWatcher,
    Plugins,
    GoldenLayout: GLComponent,
  },

  data() {
    return {
      moduleInspectorIVTitle: "Module Inspector",
      moduleInspectorIVBody:
        "The properties of the selected Module. This panel can be pinned for easy access.",
      state: null,

      triggerUiRestart: 0,

      layoutConfig: {
        showPopoutIcon: false,
        showMaximiseIcon: false,
        showCloseIcon: false,
        root: {
          type: ItemType.column,
          content: [
            {
              type: ItemType.row,
              content: [
                {
                  type: ItemType.stack,
                  content: [
                    {
                      type: ItemType.component,
                      title: "Groups",
                      componentType: "groups",
                    },
                  ],
                },
                {
                  type: ItemType.stack,
                  width: 33,
                  content: [
                    {
                      type: ItemType.component,
                      title: "Module Inspector",
                      componentType: "module-inspector",
                    },
                  ],
                },
              ],
            },
            {
              type: ItemType.row,
              content: [
                {
                  type: ItemType.stack,
                  width: 20,
                  content: [
                    {
                      type: ItemType.component,
                      title: "Info View",
                      componentType: "info-view",
                    },
                  ],
                },
                {
                  type: ItemType.stack,
                  content: [
                    {
                      type: ItemType.component,
                      title: "Gallery",
                      componentType: "gallery",
                    },
                  ],
                },
                {
                  type: ItemType.stack,
                  width: 30,
                  content: [
                    {
                      type: ItemType.component,
                      title: "InputConfig",
                      componentType: "input-config",
                    },
                    {
                      type: ItemType.component,
                      title: "Input Device Config",
                      componentType: "avd-config",
                    },
                    {
                      type: ItemType.component,
                      title: "MIDI",
                      componentType: "md-config",
                    },
                    {
                      type: ItemType.component,
                      title: "BPM",
                      componentType: "bpm-config",
                    },
                    {
                      type: ItemType.component,
                      title: "NDI",
                      componentType: "ndi-config",
                    },
                    {
                      type: ItemType.component,
                      title: "Plugins",
                      componentType: "plugins",
                    },
                  ],
                },
                {
                  type: ItemType.stack,
                  content: [
                    {
                      type: ItemType.component,
                      title: "Preview",
                      componentType: "preview",
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
  },

  computed: {
    focusedModules() {
      const focusedOrPinned = this.$store.getters["uiModules/focusedOrPinned"];
      const modules = focusedOrPinned.map(
        (id) => this.$modV.store.state.modules.active[id],
      );

      return modules;
    },

    focusedActiveModule() {
      return this.$store.state["uiModules"].focused;
    },
  },

  watch: {
    focusedActiveModule(inspectorId) {
      const index = this.$store.state["uiModules"].pinned.findIndex(
        (item) => item === inspectorId,
      );

      if (index > -1) {
        this.$refs.moduleInspector[index].focus();
      }
    },
  },

  created() {
    const layoutState = window.localStorage.getItem(constants.LAYOUT_STATE_KEY);
    if (layoutState) {
      try {
        this.layoutConfig = JSON.parse(layoutState);
      } catch (e) {
        this.creationError();
      }
    }

    ipcRenderer.on("reset-layout", () => {
      this.resetGoldenLayoutState();
      this.restartLayout();
    });
  },

  async mounted() {
    this.rightColumnWidth = window.innerWidth * 0.33;
  },

  methods: {
    toggleModulePin(id) {
      if (this.isPinned(id)) {
        this.$store.commit("uiModules/REMOVE_PINNED", id);
      } else {
        this.$store.commit("uiModules/ADD_PINNED", id);
      }
    },

    isPinned(id) {
      return this.$store.state["uiModules"].pinned.indexOf(id) > -1;
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
    // purgeDynamicPanels(config) {
    //   if (Array.isArray(config.content)) {
    //     const itemsToSplice = [];

    //     const content = config.content;
    //     const childrenToSplice = [];
    //     for (let index = 0, len = content.length; index < len; index++) {
    //       const item = content[index];

    //       if (
    //         item.type === "component" &&
    //         item.componentState.is === "dynamic"
    //       ) {
    //         itemsToSplice.push(index);
    //       } else {
    //         if (this.purgeDynamicPanels(item) === true) {
    //           childrenToSplice.push(index);
    //         }
    //       }
    //     }

    //     childrenToSplice.forEach((index) => {
    //       content.splice(index, 1);
    //       config.activeItemIndex = 0;
    //     });

    //     if (itemsToSplice.length > 0) {
    //       itemsToSplice.forEach((index) => {
    //         config.content.splice(index, 1);
    //         config.activeItemIndex = 0;
    //       });

    //       if (config.title === "" && config.type === "stack") {
    //         return true;
    //       }
    //     }
    //   }

    //   return config;
    // },

    /**
     * @description Called when <golden-layout /> updates its state.
     * Unminifies config, purges dynamically added panels, minifies and saves to
     * localStorage key `constants.LAYOUT_STATE_KEY`.
     *
     * @param {GoldenLayout config} value
     */
    updateLayoutState(configIn) {
      window.localStorage.setItem(
        constants.LAYOUT_STATE_KEY,
        JSON.stringify(configIn),
      );
    },

    async creationError() {
      const localStorageKeys = Object.keys(window.localStorage);

      const nextKey = await getNextName(
        constants.LAYOUT_STATE_KEY,
        localStorageKeys,
      );
      window.localStorage.setItem(nextKey, JSON.stringify(this.layoutState));

      console.warn(
        "Layout could not be restored. Default layout loaded and old layout was saved to a backup local storage key",
      );

      this.resetGoldenLayoutState();
      this.restartLayout();
    },

    resetGoldenLayoutState() {
      window.localStorage.removeItem(constants.LAYOUT_STATE_KEY);
      this.layoutState = undefined;
    },

    /**
     * @description Restarts Golden Layout.
     * We increment a variable which is assigned to the key of the root Golden Layout element.
     * If the key is updated, the element is forced to dismount and mount again.
     */
    restartLayout() {
      this.resetGoldenLayoutState();
      this.triggerUiRestart++;
    },
  },
};
</script>

<style>
input:focus-visible,
select:focus-visible {
  outline-style: solid;
  outline-width: 2px;
}

.tooltip {
  position: absolute;
  padding: 4px;
  color: white;
  background: #151515;
  pointer-events: none;
  z-index: 100;
}

.tooltip pre {
  overflow: hidden;
}
</style>

<style>
.smooth-dnd-container.vertical > .smooth-dnd-draggable-wrapper {
  overflow: initial;
}
</style>

<style>
body {
  background: rgb(45, 45, 45);
}

@keyframes loading {
  0% {
    font-size: 4rem;
  }

  100% {
    font-size: 7rem;
  }
}

#loading {
  font-size: 4rem;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-content: center;
}

#loading span {
  animation: loading 1.4s cubic-bezier(0.87, 0, 0.13, 1) infinite forwards
    alternate;
}
</style>

<style>
@import url("./css/inter.css");
@import url("./css/iaw.css");
@import url("./css/raster.css");
@import url("./css/golden-layout_theme.css");

:root {
  --fontSize: 16px;
  --sansFont: "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", "微軟雅黑", "Microsoft YaHei", "微軟正黑體",
    "Microsoft JhengHei", Verdana, Arial, sans-serif !important;
  --monoFont: "iaw-mono";
  --lineHeight: calc(var(--fontSize) * 1.5);
  --baseline: calc(var(--lineHeight) / 2);
  --blockSpacingTop: 0px;
  --blockSpacingBottom: var(--lineHeight);
  --hrThickness: 2px;
  --h1-size: 2.8rem;
  --h2-size: 2.2rem;
  --h3-size: 1.4rem;
  --h4-size: 1.1rem;
  --columnGap: 8px;
  --rowGap: 8px;
  --displayScale: 1;
  --pixel: 1px;
  --foreground-color-rgb: 255, 255, 255;
  --foreground-color-a: 1;
  --foreground-color: rgba(
    var(--foreground-color-rgb),
    var(--foreground-color-a)
  );

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
  font-size: 14px;
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
</style>

<style>
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-track {
  background: #c4c4c4;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #363636;
}

::-webkit-scrollbar-corner,
::-webkit-resizer {
  background: transparent;
}
</style>
