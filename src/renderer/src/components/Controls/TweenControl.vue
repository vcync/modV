<template>
  <grid columns="4">
    <c span="1">Keyframes</c>

    <c span="3">
      <div class="tween-data-editor">
        <!-- Keyframe Editor -->
        <div class="keyframe-editor">
          <div class="keyframes-section">
            <div class="keyframes-header">
              <div class="keyframe-controls">
                <button class="add-keyframe-btn" @click="addKeyframe">
                  + Add Keyframe
                </button>
                <button class="clear-btn" @click="clearTween">Clear</button>
              </div>
              <div class="shift-controls">
                <button
                  class="shift-btn"
                  :disabled="parsedData.length <= 1"
                  @click="shiftKeyframesBack"
                >
                  ← Shift Back
                </button>
                <button
                  class="shift-btn"
                  :disabled="parsedData.length <= 1"
                  @click="shiftKeyframesForward"
                >
                  Shift Forward →
                </button>
              </div>
            </div>

            <Container
              drag-handle-selector=".keyframe-drag-handle"
              lock-axis="y"
              :should-animate-drop="() => false"
              class="keyframes-container"
              @drop="onKeyframeDrop"
            >
              <div v-if="parsedData.length === 0" class="no-keyframes">
                No keyframes. Add a keyframe or use a preset template below.
              </div>
              <Draggable v-for="(keyframe, index) in parsedData" :key="index">
                <div class="keyframe-item">
                  <div class="keyframe-drag-handle">⋮⋮</div>
                  <div class="keyframe-index">#{{ index + 1 }}</div>
                  <div class="keyframe-values">
                    <div
                      v-for="(value, valueIndex) in keyframe"
                      :key="valueIndex"
                      class="value-input-group"
                    >
                      <input
                        type="number"
                        :value="value"
                        class="value-input"
                        step="any"
                        @input="
                          updateKeyframeValue(
                            index,
                            valueIndex,
                            $event.target.value,
                          )
                        "
                      />
                    </div>
                  </div>
                  <button
                    class="remove-keyframe-btn"
                    @click="removeKeyframe(index)"
                  >
                    ×
                  </button>
                </div>
              </Draggable>
            </Container>

            <!-- Preset Templates -->
            <div class="preset-templates">
              <div class="preset-buttons">
                <button
                  v-for="preset in presetTemplates"
                  :key="preset.name"
                  class="preset-button"
                  @click="applyPreset(preset.data)"
                >
                  {{ preset.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </c>

    <c span="1">Data</c>
    <c span="3">
      <div class="data-preview">
        <textarea
          v-model="modelData"
          class="data-preview-textarea"
          @input="updateFromJSON"
        ></textarea>
      </div>
    </c>

    <c span="1+1">Easing</c>
    <c span="2">
      <div class="easing-controls">
        <Select
          :key="`easing-select-${baseEasings.length}`"
          v-model="baseEasing"
          :class="color"
          :disabled="!!modelSteps"
          @update:model-value="updateEasing"
        >
          <option
            v-for="easing in baseEasings"
            :key="easing.value"
            :value="easing.value"
          >
            {{ easing.label }}
          </option>
        </Select>
        <Radio
          v-model="easingVariant"
          :options="easingVariants"
          :style="'button'"
          :class="color"
          :disabled="!!modelSteps || baseEasing === 'linear'"
          @update:model-value="setEasingVariant"
        />
      </div>
    </c>

    <c span="1+1">Duration</c>
    <c span="2">
      <Number
        v-model="modelDuration"
        :class="color"
        :disabled="modelUseBpm"
        @update:model-value="updateValue"
      />
    </c>

    <c span="1+1">Use BPM</c>
    <c>
      <Checkbox
        v-model="modelUseBpm"
        :class="color"
        emit-boolean
        @update:model-value="updateValue"
      />
    </c>

    <c span="1+1"><label :for="`${111}-bpmDivision`">BPM Multiplier</label></c>
    <c span="2">
      <!-- <Select
        v-model.number="modelBpmDivision"
        :class="color"
        @update:model-value="updateValue"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="4">4</option>
        <option value="8">8</option>
        <option value="16">16</option>
        <option value="32">32</option>
        <option value="64">64</option>
        <option value="128">128</option>
        <option value="256">256</option>
      </Select> -->

      <Radio
        v-model.number="modelBpmDivision"
        :options="bpmDivisionOptions"
        :style="'button'"
        :class="color"
        @update:model-value="updateValue"
      />
    </c>

    <c span="1+1">
      <label title="">Loop</label>
    </c>
    <c span="2">
      <Checkbox
        v-model="modelLoop"
        :class="color"
        @update:model-value="updateValue"
      />
    </c>

    <c span="1+1">
      <label
        title="If unchecked the duration will be used per step. duration * numberOfSteps"
        >Duration as total time</label
      >
    </c>
    <c span="2">
      <Checkbox
        v-model="modelDurationAsTotalTime"
        :class="color"
        @update:model-value="updateValue"
      />
    </c>

    <c span="1+1">
      <label
        title="If greater than 0 step mode will be enabled, which steps a linear animation over the given amount of steps"
      >
        Steps
      </label>
    </c>
    <c span="2">
      <Number
        v-model.number="modelSteps"
        :class="color"
        @update:model-value="updateValue"
      />
    </c>
  </grid>
</template>

<script>
import { Container, Draggable } from "vue3-smooth-dnd";
import Radio from "../inputs/Radio.vue";

const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) {
    return arr;
  }

  const result = [...arr];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

export default {
  components: {
    Container,
    Draggable,
    Radio,
  },

  props: {
    modelValue: { type: undefined },
    color: { type: undefined },
  },
  emits: ["update:modelValue"],

  data() {
    return {
      modelData: "",
      modelDuration: 1000,
      modelEasing: "linear",
      modelUseBpm: true,
      modelBpmDivision: 32,
      modelDurationAsTotalTime: false,
      modelSteps: 0,
      modelLoop: true,
      isUpdating: false, // Flag to prevent recursive updates
      baseEasing: "linear",
      easingVariant: "InOut",
      bpmDivisionOptions: [
        { value: 1, label: "1/32×" },
        { value: 2, label: "1/16×" },
        { value: 4, label: "1/8×" },
        { value: 8, label: "1/4×" },
        { value: 16, label: "1/2×" },
        { value: 32, label: "1×" },
        { value: 64, label: "2x" },
        { value: 128, label: "4x" },
        { value: 256, label: "8x" },
      ],
    };
  },

  computed: {
    easings() {
      return this.$modV.store.state.tweens.easings;
    },

    baseEasings() {
      const baseEasingTypes = new Set(
        this.easings.map(({ value }) =>
          (
            value.match(/ease(?:In(?:Out?)?|Out(?:In?)?)(.*?)\b/)?.[1] ??
            "linear"
          ).toLowerCase(),
        ),
      );

      return Array.from(baseEasingTypes).map((name) => ({
        value: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
      }));
    },

    easingVariants() {
      return [
        { value: "In", label: "In" },
        { value: "Out", label: "Out" },
        { value: "InOut", label: "In Out" },
        { value: "OutIn", label: "Out In" },
      ];
    },

    parsedData: {
      get() {
        try {
          return this.modelData.length ? JSON.parse(this.modelData) : [];
        } catch (e) {
          return [];
        }
      },
      set(value) {
        this.modelData = JSON.stringify(value);
      },
    },

    presetTemplates() {
      // Get the control type from the parent component
      const controlType = this.getControlType();
      const controlProps = this.getControlProps();

      const templates = [];

      if (controlType === "float" || controlType === "int") {
        // Single value controls
        const min = controlProps?.min ?? 0;
        const max = controlProps?.max ?? 1;
        const step = controlProps?.step ?? 0.1;

        templates.push(
          { name: `${min}→${max}`, data: [[min], [max]] },
          { name: `${max}→${min}`, data: [[max], [min]] },
          { name: `${min}→${max}→${min}`, data: [[min], [max], [min]] },
          {
            name: "Pulse",
            data: [[(min + max) / 2], [max], [(min + max) / 2]],
          },
          { name: "Oscillate", data: [[min], [max], [min], [max]] },
        );

        // Add step-based templates if step is significant
        if (step > 0 && (max - min) / step <= 10) {
          const steps = Math.floor((max - min) / step);
          if (steps > 1) {
            templates.push(
              {
                name: "Step Up",
                data: Array.from({ length: steps + 1 }, (_, i) => [
                  min + i * step,
                ]),
              },
              {
                name: "Step Down",
                data: Array.from({ length: steps + 1 }, (_, i) => [
                  max - i * step,
                ]),
              },
            );
          }
        }
      } else if (controlType === "vec2") {
        // 2D vector controls
        templates.push(
          {
            name: "0,0→1,1",
            data: [
              [0, 0],
              [1, 1],
            ],
          },
          {
            name: "1,1→0,0",
            data: [
              [1, 1],
              [0, 0],
            ],
          },
          {
            name: "Circle",
            data: [
              [0, 0],
              [1, 0],
              [0, 1],
              [0, 0],
            ],
          },
          {
            name: "Square",
            data: [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          },
        );
      } else if (controlType === "vec3") {
        // 3D vector controls
        templates.push(
          {
            name: "0,0,0→1,1,1",
            data: [
              [0, 0, 0],
              [1, 1, 1],
            ],
          },
          {
            name: "RGB Cycle",
            data: [
              [1, 0, 0],
              [0, 1, 0],
              [0, 0, 1],
              [1, 0, 0],
            ],
          },
          {
            name: "RGB Fade",
            data: [
              [1, 0, 0],
              [0, 1, 0],
              [0, 0, 1],
            ],
          },
        );
      } else if (controlType === "vec4") {
        // 4D vector controls (often RGBA)
        templates.push(
          {
            name: "0,0,0,0→1,1,1,1",
            data: [
              [0, 0, 0, 0],
              [1, 1, 1, 1],
            ],
          },
          {
            name: "RGBA Cycle",
            data: [
              [1, 0, 0, 1],
              [0, 1, 0, 1],
              [0, 0, 1, 1],
              [1, 0, 0, 1],
            ],
          },
          {
            name: "Fade In/Out",
            data: [
              [0, 0, 0, 0],
              [1, 1, 1, 1],
              [0, 0, 0, 0],
            ],
          },
        );
      } else if (controlType === "color") {
        // Color controls
        templates.push(
          {
            name: "Black→White",
            data: [
              [0, 0, 0, 1],
              [1, 1, 1, 1],
            ],
          },
          {
            name: "RGB Cycle",
            data: [
              [1, 0, 0, 1],
              [0, 1, 0, 1],
              [0, 0, 1, 1],
              [1, 0, 0, 1],
            ],
          },
          {
            name: "Fade In",
            data: [
              [0, 0, 0, 0],
              [1, 1, 1, 1],
            ],
          },
          {
            name: "Fade Out",
            data: [
              [1, 1, 1, 1],
              [0, 0, 0, 0],
            ],
          },
        );
      }

      return templates;
    },
  },

  watch: {
    "$store.state.bpm"(value) {
      if (this.modelUseBpm) {
        this.modelDuration = value / this.modelBpmDivision;
        this.updateValue();
      }
    },

    modelValue(value) {
      this.setData(value);
    },

    modelEasing(value) {
      // Update base easing and variant when modelEasing changes
      this.parseEasing(value);
    },

    parsedData: {
      handler() {
        this.updateValue();
      },
      deep: true,
    },

    // Watch for changes in the parent's activeProp to detect control switches
    "$parent.activeProp": {
      handler(newProp, oldProp) {
        // Only clear data if we're switching to a different control
        if (oldProp && newProp && oldProp.id !== newProp.id) {
          this.$nextTick(() => {
            if (!this.modelValue) {
              // Clear the display when switching to a control with no tween data
              this.modelData = "";
            }
          });
        }
      },
      deep: true,
    },
  },

  created() {
    this.setData(this.modelValue);
    // Initialize easing if not set
    if (!this.baseEasing || !this.easingVariant) {
      this.parseEasing(this.modelEasing);
    }
  },

  methods: {
    updateValue() {
      // Don't emit if we're in the middle of setting data from parent
      if (this.isUpdating) {
        return;
      }

      const data = this.modelData.length ? JSON.parse(this.modelData) : [];
      const duration = this.modelDuration;
      const easing = this.modelEasing;
      const useBpm = this.modelUseBpm;
      const bpmDivision = this.modelBpmDivision;
      const durationAsTotalTime = this.modelDurationAsTotalTime;
      const steps = this.modelSteps;
      const loop = this.modelLoop;

      this.$emit("update:modelValue", {
        ...this.modelValue,
        data,
        duration,
        easing,
        useBpm,
        bpmDivision,
        durationAsTotalTime,
        steps,
        loop,
      });
    },

    setData(value) {
      this.isUpdating = true;

      if (!value || !value.data) {
        this.modelData = "";
      } else {
        this.modelData = JSON.stringify(value.data);
      }
      this.modelDuration = value?.duration ?? 1000;
      this.modelEasing = value?.easing ?? "linear";
      this.modelUseBpm = value?.useBpm ?? true;
      this.modelBpmDivision = value?.bpmDivision ?? 32;
      this.modelDurationAsTotalTime = value?.durationAsTotalTime ?? false;
      this.modelSteps = value?.steps ?? 0;
      this.modelLoop = value?.loop ?? true;

      // Parse the easing to set base easing and variant
      this.$nextTick(() => {
        this.parseEasing(this.modelEasing);
      });

      this.$nextTick(() => {
        this.isUpdating = false;
      });
    },

    setDefaultData() {
      // Create default data based on control type
      const controlType = this.getControlType();
      let defaultData;

      switch (controlType) {
        case "vec2":
          defaultData = [
            [0, 0],
            [1, 1],
          ];
          break;
        case "vec3":
          defaultData = [
            [0, 0, 0],
            [1, 1, 1],
          ];
          break;
        case "vec4":
        case "color":
          defaultData = [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
          ];
          break;
        default:
          defaultData = [[0], [1]];
      }

      this.setData({
        data: defaultData,
        duration: 1000,
        easing: "linear",
        useBpm: true,
        bpmDivision: 32,
        durationAsTotalTime: false,
        steps: 0,
        loop: false,
      });
    },

    applyPreset(data) {
      this.parsedData = data;
    },

    addKeyframe() {
      const newKeyframe =
        this.parsedData.length > 0
          ? [...this.parsedData[this.parsedData.length - 1]]
          : [0];
      this.parsedData = [...this.parsedData, newKeyframe];
    },

    removeKeyframe(index) {
      if (this.parsedData.length > 1) {
        const newData = [...this.parsedData];
        newData.splice(index, 1);
        this.parsedData = newData;
      }
    },

    updateKeyframeValue(keyframeIndex, valueIndex, value) {
      const newData = [...this.parsedData];
      newData[keyframeIndex] = [...newData[keyframeIndex]];
      newData[keyframeIndex][valueIndex] = parseFloat(value) || 0;
      this.parsedData = newData;
    },

    clearTween() {
      // Create a default keyframe based on the control type
      const controlType = this.getControlType();
      let defaultKeyframe;

      switch (controlType) {
        case "vec2":
          defaultKeyframe = [0, 0];
          break;
        case "vec3":
          defaultKeyframe = [0, 0, 0];
          break;
        case "vec4":
        case "color":
          defaultKeyframe = [0, 0, 0, 0];
          break;
        default:
          defaultKeyframe = [0];
      }

      this.parsedData = [defaultKeyframe];
    },

    updateFromJSON() {
      try {
        const parsed = JSON.parse(this.modelData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Validate that all keyframes have the same number of values
          const expectedLength = parsed[0].length;
          const isValid = parsed.every(
            (keyframe) =>
              Array.isArray(keyframe) && keyframe.length === expectedLength,
          );

          if (isValid) {
            this.parsedData = parsed;
          }
        }
      } catch (e) {
        // Invalid JSON - don't update the parsed data
        // The textarea will show the invalid JSON for the user to fix
      }
    },

    getControlType() {
      // Try to get control type from parent components
      // This will work when TweenControl is used within Control.vue
      if (this.$parent && this.$parent.activeProp) {
        return this.$parent.activeProp.type;
      }

      // Fallback: try to infer from current data structure
      if (this.parsedData.length > 0 && this.parsedData[0].length > 0) {
        const valueCount = this.parsedData[0].length;
        if (valueCount === 1) return "float";
        if (valueCount === 2) return "vec2";
        if (valueCount === 3) return "vec3";
        if (valueCount === 4) return "vec4";
      }

      return "float"; // Default fallback
    },

    getControlProps() {
      // Try to get control properties from parent components
      if (this.$parent && this.$parent.activeProp) {
        return this.$parent.activeProp;
      }
      return null;
    },

    onKeyframeDrop(e) {
      this.parsedData = applyDrag(this.parsedData, e);
    },

    shiftKeyframesForward() {
      if (this.parsedData.length > 1) {
        const newData = [...this.parsedData];
        const lastKeyframe = newData.pop();
        newData.unshift(lastKeyframe);
        this.parsedData = newData;
      }
    },

    shiftKeyframesBack() {
      if (this.parsedData.length > 1) {
        const newData = [...this.parsedData];
        const firstKeyframe = newData.shift();
        newData.push(firstKeyframe);
        this.parsedData = newData;
      }
    },

    updateEasing() {
      // For linear easing, don't add variant prefix
      if (this.baseEasing === "linear") {
        this.modelEasing = "linear";
      } else {
        // The variant is already properly capitalized, just combine with base
        const base =
          this.baseEasing.charAt(0).toUpperCase() + this.baseEasing.slice(1);

        this.modelEasing = `ease${this.easingVariant}${base}`;
      }

      this.updateValue();
    },

    setEasingVariant(variant) {
      this.easingVariant = variant;
      this.updateEasing();
    },

    parseEasing(easing) {
      if (!easing || easing === "linear") {
        this.baseEasing = "linear";
        this.easingVariant = "InOut";
        return;
      }

      // Parse easing like "easeInOutQuad" or "easeOutCubic"
      const match = easing.match(/^ease(In(?:Out?)?|Out(?:In?)?)(.+)$/);
      if (match) {
        const variant = match[1];
        const base = match[2].toLowerCase();
        this.easingVariant = variant;
        this.baseEasing = base;
      } else {
        // Try to find the easing in the available easings list
        const foundEasing = this.easings.find((e) => e.value === easing);
        if (foundEasing) {
          // Extract base and variant from the found easing
          const match2 = foundEasing.value.match(
            /^ease(In(?:Out?)?|Out(?:In?)?)(.+)$/,
          );
          if (match2) {
            const variant = match2[1];
            const base = match2[2].toLowerCase();
            this.easingVariant = variant;
            this.baseEasing = base;
          } else {
            this.baseEasing = "linear";
            this.easingVariant = "InOut";
          }
        } else {
          // Fallback for unknown easing
          this.baseEasing = "linear";
          this.easingVariant = "InOut";
        }
      }
    },
  },
};
</script>

<style scoped>
.tween-data-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.keyframes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 8px;
}

.keyframe-controls {
  display: flex;
  gap: 8px;
}

.shift-controls {
  display: flex;
  gap: 8px;
}

.add-keyframe-btn,
.clear-btn,
.shift-btn {
  -webkit-appearance: none;
  background: #363636;
  border: none;
  padding: 6px 12px;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  line-height: 1;
  font-family: inherit;
}

.add-keyframe-btn:hover,
.clear-btn:hover,
.shift-btn:hover {
  background: #484848;
}

.add-keyframe-btn:active,
.clear-btn:active,
.shift-btn:active {
  background: #9a9a9a;
}

.shift-btn:disabled {
  background: #151515;
  color: #9a9a9a;
  cursor: not-allowed;
}

.shift-btn:disabled:hover {
  background: #151515;
}

.easing-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-templates {
  margin: 8px 0;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.keyframe-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.keyframes-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.keyframe-drag-handle {
  color: #9a9a9a;
  font-size: 14px;
  cursor: grab;
  user-select: none;
  padding: 0 4px;
  display: flex;
  align-items: center;
}

.keyframe-drag-handle:active {
  cursor: grabbing;
}

.no-keyframes {
  color: #9a9a9a;
  font-size: 12px;
  text-align: center;
  padding: 16px 8px;
  font-style: italic;
}

.keyframe-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #484848;
  border: 1px solid #666666;
}

.keyframe-index {
  font-size: 12px;
  color: #ffffff;
  min-width: 24px;
  font-weight: bold;
}

.keyframe-values {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.value-input-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.value-input {
  -webkit-appearance: none;
  background: #c4c4c4;
  border: none;
  height: 20px;
  font-size: 12px;
  padding: 0 4px;
  box-sizing: border-box;
  width: 50px;
  text-align: center;
}

.value-input:focus {
  outline: none;
}

.remove-keyframe-btn {
  -webkit-appearance: none;
  background: #363636;
  border: none;
  width: 24px;
  height: 24px;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-family: inherit;
}

.remove-keyframe-btn:hover {
  background: #484848;
}

.remove-keyframe-btn:active {
  background: #9a9a9a;
}

.data-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-preview label {
  font-size: 12px;
  color: #ffffff;
}

.data-preview-textarea {
  -webkit-appearance: none;
  background: #c4c4c4;
  border: none;
  min-height: 32px;
  font-size: 11px;
  font-family: monospace;
  padding: 4px 6px;
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
}

.preset-button {
  -webkit-appearance: none;
  background: #363636;
  border: none;
  padding: 4px 8px;
  font-size: 11px;
  color: #ffffff;
  cursor: pointer;
  line-height: 1;
  font-family: inherit;
}

.preset-button:hover {
  background: #484848;
}

.preset-button:active {
  background: #9a9a9a;
}
</style>
