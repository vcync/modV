<template>
  <main id="app">
    <golden-layout
      class="hscreen"
      :showCloseIcon="false"
      :showPopoutIcon="false"
      :showMaximiseIcon="false"
      :state.sync="layoutState"
      @state="updateLayoutState"
      @creation-error="creationError"
      :headerHeight="18"
      :key="triggerUiRestart"
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
                v-for="(module, i) in focusedModules"
                :key="i"
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
            <gl-component title="Input Config" :closable="false">
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

            <gl-component title="Plugins" :closable="false">
              <Plugins />
            </gl-component>
          </gl-stack>

          <gl-stack title="Preview Stack">
            <gl-component title="Preview" :closable="false">
              <Preview />
            </gl-component>
          </gl-stack>
        </gl-row>
      </gl-col>
    </golden-layout>

    <StatusBar />
    <Search />

    <FrameRateDialog />

    <ErrorWatcher />
  </main>
</template>

<script>
import Preview from "@/components/Preview";
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
import FrameRateDialog from "@/components/dialogs/FrameRateDialog";
import ErrorWatcher from "@/components/ErrorWatcher";
import Plugins from "@/components/Plugins";

import getNextName from "@/application/utils/get-next-name";
import constants from "@/application/constants";

import * as GoldenLayout from "golden-layout";
import { ipcRenderer } from "electron";

export default {
  name: "app",

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
    Plugins
  },

  data() {
    return {
      moduleInspectorIVTitle: "Module Inspector",
      moduleInspectorIVBody:
        "The properties of the selected Module. This panel can be pinned for easy access.",
      state: null,
      layoutState: null,

      triggerUiRestart: 0
    };
  },

  computed: {
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
    const layoutState = window.localStorage.getItem(constants.LAYOUT_STATE_KEY);
    if (layoutState) {
      try {
        this.layoutState = JSON.parse(layoutState);
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
    },

    async creationError() {
      const localStorageKeys = Object.keys(window.localStorage);

      const nextKey = await getNextName(
        constants.LAYOUT_STATE_KEY,
        localStorageKeys
      );
      window.localStorage.setItem(nextKey, JSON.stringify(this.layoutState));

      console.warn(
        "Layout could not be restored. Default layout loaded and old layout was saved to a backup local storage key"
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
