<template>
  <Dialog
    v-if="$store.state.dialogs.open.includes('screenPicker')"
    title="Select screen or window"
    @close="dialogClosed"
  >
    <grid columns="6" style="margin-bottom: 12px">
      <c span="1">FPS</c>
      <c span="2">
        <Number v-model.number="fps" :min="1" :max="240" />
      </c>
      <c span="1">Cursor</c>
      <c span="2">
        <Checkbox
          :model-value="showCursor"
          :emit-boolean="true"
          class="light"
          @update:model-value="(v) => (showCursor = v)"
        />
      </c>
    </grid>

    <div style="margin-bottom: 12px">
      <div class="section-title">Available Sources</div>
      <div class="sources-grid">
        <div
          v-for="s in sources"
          :key="s.id"
          class="source-item"
          :class="{ selected: selectedSource?.id === s.id }"
          @click="selectedSource = s"
        >
          <div class="thumb">
            <img :src="s.thumbnailUrl || ''" alt="" />
          </div>
          <div class="meta">
            <span>{{ s.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-actions">
      <Button
        class="light"
        :disabled="!selectedSource"
        @click="startFromSelectedSource"
      >
        Start Capture
      </Button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from "../Dialog.vue";
import Number from "../inputs/Number.vue";
import Checkbox from "../inputs/Checkbox.vue";
import { v4 as uuidv4 } from "uuid";

export default {
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Dialog,
    Number,
    Checkbox,
  },
  data() {
    return {
      sources: [],
      selectedSource: null,
      fps: 60,
      showCursor: false,
    };
  },
  watch: {
    // Refresh sources when dialog opens
    "$store.state.dialogs.open": {
      handler(newOpenDialogs) {
        if (newOpenDialogs.includes("screenPicker")) {
          this.enumerateSources();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.enumerateSources();
  },
  methods: {
    async enumerateSources() {
      try {
        const { desktopCapturer } = window.remote;
        const rawSources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 480, height: 300 },
        });
        this.sources = rawSources.map((s) => ({
          id: s.id,
          name: s.name,
          thumbnailUrl:
            s.thumbnail && s.thumbnail.toDataURL ? s.thumbnail.toDataURL() : "",
        }));
      } catch (e) {
        console.error("Failed to enumerate display sources", e);
      }
    },

    async startFromSelectedSource() {
      if (!this.selectedSource) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            cursor: this.showCursor ? "always" : "never",
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: this.selectedSource.id,
              maxFrameRate: this.fps,
              // Request continuous capture that doesn't pause when backgrounded
              minFrameRate: this.fps,
              // Force continuous capture
              googLeakyBucket: true,
              googTemporalLayeredScreencast: false,
              googNoiseReduction: false,
            },
          },
        });
        await this._startFromStream(stream, this.selectedSource.name);
        this.dialogClosed();
      } catch (e) {
        console.error("Failed to start from selected source", e);
      }
    },

    async _startFromStream(stream, nameOverride) {
      const [track] = stream.getVideoTracks();
      const fallbackId = `screen-${Date.now()}`;
      const displayLabel = nameOverride || (track && track.label) || fallbackId;
      const screenId = uuidv4(); // Unique ID

      const videoEl = document.createElement("video");
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.onloadedmetadata = () => videoEl.play();

      const outputId = screenId;

      track.onended = () => {
        this.$modV.store.dispatch("outputs/removeAuxillaryOutput", outputId);
      };

      const draw = () => {
        if (track.readyState === "ended") return;

        const { videoWidth: w, videoHeight: h } = videoEl;

        if (w && h) {
          createImageBitmap(videoEl)
            .then((bitmap) => {
              this.$modV.$worker.postMessage(
                {
                  type: "screenFrame",
                  payload: { id: outputId, label: displayLabel, bitmap },
                },
                [bitmap],
              );
            })
            .catch(() => {});
        }

        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    },

    dialogClosed() {
      // Reset dialog state
      this.selectedSource = null;
      this.fps = 60;
      this.showCursor = false;

      // Remove from Vuex store
      this.$store.commit("dialogs/REMOVE_OPEN", "screenPicker");
    },
  },
};
</script>

<style scoped>
.section-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--foreground-color);
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.source-item {
  background: var(--background-color-2);
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.source-item:hover {
  background: var(--background-color-3);
  border-color: var(--foreground-color-2);
}

.source-item.selected {
  border-color: var(--accent-color);
  background: var(--background-color-3);
}

.source-item .thumb {
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  border-radius: 2px;
}

.source-item .thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--foreground-color);
  text-align: center;
  word-break: break-word;
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--background-color-2);
}
</style>
