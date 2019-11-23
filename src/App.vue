<template>
  <main id="app">
    <golden-layout class="hscreen" :showPopoutIcon="false" v-model="state">
      <gl-col :closable="false" id="lr-col">
        <gl-component title="Groups" :closable="false">
          <Groups />
        </gl-component>
        <gl-row>
          <gl-component title="Gallery" :closable="false">
            <Gallery />
          </gl-component>

          <gl-stack>
            <gl-component title="Preview" :closable="false">
              <CanvasDebugger />
            </gl-component>

            <gl-component title="Swap" :closable="false">
              <ABSwap />
            </gl-component>
          </gl-stack>

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
    StatusBar
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
    }
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=IBM+Plex+Mono:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i|IBM+Plex+Sans:100,100i,200,200i,300,300i,400,400i,500,500i,600,600i,700,700i&display=swap");
@import url("https://rsms.me/raster/raster.css?v=6");

html,
body,
#app {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

body {
  color: #fff;

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
