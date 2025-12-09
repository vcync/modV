<template>
  <div
    v-infoView="{ title: iVTitle, body: iVBody, id: 'Screen Capture Config' }"
    v-searchTerms="{
      terms: ['screen', 'capture', 'display'],
      title: 'Screen Capture',
      type: 'Panel',
    }"
    class="device-config"
  >
    <grid class="borders">
      <c span="1..">
        <grid columns="6">
          <c span="1">Screen Capture</c>
          <c span="5">
            <Button class="light" @click="openPickerDialog">
              Pick Screen/Window…
            </Button>
          </c>
        </grid>
      </c>

      <c span="1..">
        <grid columns="6">
          <c span="1">Active Captures</c>
          <c span="5">
            <div v-if="captures.length === 0" class="muted">None</div>
            <div v-else class="captures-list">
              <div v-for="cap in captures" :key="cap.id" class="capture-item">
                <div class="capture-info">
                  <span class="capture-name">{{ cap.name }}</span>
                  <span v-if="cap.disconnected" class="muted"
                    >(disconnected)</span
                  >
                </div>
                <div class="capture-actions">
                  <Button
                    v-if="cap.disconnected"
                    class="light"
                    @click="reconnectCapture(cap)"
                  >
                    Reconnect
                  </Button>
                  <Button class="light" @click="createTextureModule(cap)">
                    Create Texture Module
                  </Button>
                  <Button class="light" @click="stopCapture(cap.id)">
                    Stop
                  </Button>
                </div>
              </div>
            </div>
          </c>
        </grid>
      </c>
    </grid>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

export default {
  data() {
    return {
      iVTitle: "Screen Capture",
      iVBody:
        "Capture one or more windows/screens using the Screen Capture API. Captures persist in presets, and missing sources will show a warning upon loading.",
      screenStreams: {},
    };
  },
  computed: {
    captures() {
      const aux = this.$modV.store.state.outputs.auxillary;
      return Object.values(aux).filter((o) => o.group === "screen");
    },
  },
  methods: {
    openPickerDialog() {
      // Open global screen picker dialog component mounted in App.vue
      this.$store.commit("dialogs/ADD_OPEN", "screenPicker");
    },

    async reconnectCapture(cap) {
      try {
        const { id, name } = cap;
        // Try getDisplayMedia with system picker if available; fall back to direct selection by name
        // Prefer direct selection via desktopCapturer to avoid user re-pick
        const { desktopCapturer } = window.remote;
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 0, height: 0 },
        });
        // Match by exact name first; if multiple, pick first. If none, bail.
        const match =
          sources.find((s) => s.name === name) ||
          sources.find((s) => s.id === id);
        if (!match) {
          // Could not find source; leave disconnected state
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: match.id,
              // Request continuous capture that doesn't pause when backgrounded
              minFrameRate: 60,
              maxFrameRate: 60,
              googLeakyBucket: true,
              googTemporalLayeredScreencast: false,
            },
          },
        });
        await this._startFromStream(stream, match.name);
      } catch (e) {
        console.error("Reconnect failed", e);
      }
    },

    async startCapture() {
      try {
        // Use getDisplayMedia with continuous capture constraints
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: this.showCursor ? "always" : "never",
            frameRate: { ideal: 60, min: 30 },
            displaySurface: "monitor",
            logicalSurface: false,
          },
          audio: false,
        });
        await this._startFromStream(stream);
      } catch (e) {
        console.error("Screen capture failed", e);
        // macOS denied: open settings
        if (
          e &&
          (e.name === "NotAllowedError" || e.message?.includes("denied"))
        ) {
          try {
            window.remote?.shell?.openExternal(
              "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
            );
          } catch (_) {
            // ignore
          }
        }
      }
    },

    async _startFromStream(stream, nameOverride) {
      const [track] = stream.getVideoTracks();
      const fallbackId = `screen-${Date.now()}`;
      const displayLabel = nameOverride || (track && track.label) || fallbackId;
      const screenId = uuidv4(); // Unique ID

      // Pump frames using ImageBitmap -> worker (transferable) to avoid cloning contexts
      const videoEl = document.createElement("video");
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.onloadedmetadata = () => videoEl.play();

      // Track end cleanup
      const outputId = screenId;

      track.onended = () => {
        // Mark disconnected; retain entry so user sees it and can re-create
        const auxId = this.$modV.store.state.outputs.screenAuxById?.[outputId];
        if (auxId) {
          this.$modV.store.commit("outputs/UPDATE_AUXILLARY", {
            auxillaryId: auxId,
            data: { disconnected: true },
          });
        }
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

      // Save reference so we can stop later
      this.screenStreams[outputId] = {
        id: outputId,
        stream,
        track,
        videoEl,
        name: displayLabel, // Use the human-readable name for display
      };
    },

    stopCapture(id) {
      const aux = this.$modV.store.state.outputs.auxillary[id];
      const ref = this.screenStreams[id];
      if (ref && ref.stream) {
        try {
          ref.stream.getTracks().forEach((t) => t.stop());
        } catch (e) {
          console.error(e);
        }
      }
      if (ref) delete this.screenStreams[id];
      if (!aux) return;
      this.$modV.store.dispatch("outputs/removeAuxillaryOutput", id);
    },

    async createTextureModule(cap) {
      try {
        // Get the current focused group
        const focusedGroupId = this.$store.state.uiGroups.lastFocused;
        if (!focusedGroupId) {
          console.warn("No focused group found");
          return;
        }

        // Create a Texture2D module
        const module = await this.$modV.store.dispatch(
          "modules/makeActiveModule",
          {
            moduleName: "Texture 2D",
          },
        );

        // Validate that the module was created successfully
        if (!module || !module.$id) {
          console.error("Failed to create Texture 2D module");
          return;
        }

        // Set the texture property to point to this screen capture
        await this.$modV.store.dispatch("modules/updateProp", {
          moduleId: module.$id,
          prop: "texture",
          data: {
            type: "screen",
            options: {
              id: cap.id,
            },
          },
        });

        // Get the current group to determine position
        const group = this.$modV.store.state.groups.groups.find(
          (g) => g.id === focusedGroupId,
        );
        const selectedModuleId = this.$store.state.uiModules.focused;

        let position = group.modules.length; // Default to end

        // If there's a selected module, insert to the right of it
        if (selectedModuleId) {
          const selectedIndex = group.modules.findIndex(
            (m) => m === selectedModuleId,
          );
          if (selectedIndex !== -1) {
            position = selectedIndex + 1;
          }
        }

        // Add the module to the group
        this.$modV.store.commit("groups/ADD_MODULE_TO_GROUP", {
          moduleId: module.$id,
          groupId: focusedGroupId,
          position,
        });

        // Focus the new module
        this.$store.commit("uiModules/SET_FOCUSED", module.$id);
      } catch (e) {
        console.error("Failed to create texture module", e);
      }
    },
  },
};
</script>

<style scoped>
.muted {
  color: var(--foreground-color-2);
}

.captures-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.capture-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--background-color-2);
  border-radius: 4px;
  border: 1px solid var(--background-color-3);
}

.capture-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.capture-name {
  font-weight: 500;
  color: var(--foreground-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.capture-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .capture-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .capture-actions {
    align-self: flex-end;
  }
}
</style>
