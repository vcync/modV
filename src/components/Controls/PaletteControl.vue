<template>
  <grid columns="4">
    <c span="1">Colors</c>

    <c span="2">
      <div class="swatches">
        <label
          class="swatch"
          v-for="(color, index) in value.data"
          :key="index"
          :style="{
            backgroundColor: `rgb(${color[0]},${color[1]},${color[2]})`,
            transitionDuration: `${modelDuration / value.data.length}ms`
          }"
          @click.right="removeSwatch(index)"
        >
          <input
            type="color"
            :value="getHexFromRgb(color)"
            @input="updateModel($event, index)"
            class="swatch"
          />
        </label>
        <button class="swatch add-swatch" @click="addSwatch"></button>
      </div>
    </c>

    <c span="1+1">Easing</c>
    <c span="2">
      <Select v-model.number="modelEasing" :disabled="!!modelSteps">
        <option
          v-for="easing in easings"
          :key="easing.value"
          :value="easing.value"
          >{{ easing.label }}</option
        >
      </Select>
    </c>

    <c span="1+1">Duration</c>
    <c span="2">
      <Number v-model="modelDuration" :disabled="modelUseBpm" />
    </c>

    <c span="1+1">Use BPM</c>
    <c><Checkbox v-model="modelUseBpm"/></c>

    <c span="1+1"><label :for="`${111}-bpmDivision`">BPM Division</label></c>
    <c span="2">
      <Select v-model.number="modelBpmDivision">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="4">4</option>
        <option value="8">8</option>
        <option value="16">16</option>
        <option value="32">32</option>
        <option value="64">64</option>
        <option value="128">128</option>
        <option value="256">256</option>
      </Select>
    </c>

    <c span="1+1">
      <label
        title="If unchecked the duration will be used per step. duration * numberOfSteps"
        >Duration as total time</label
      >
    </c>
    <c span="2">
      <Checkbox v-model="modelDurationAsTotalTime" />
    </c>

    <c span="1+1">
      <label
        title="If greater than 0 step mode will be enabled, which steps a linear animation over the given amount of steps"
      >
        Steps
      </label>
    </c>
    <c span="2">
      <Number v-model.number="modelSteps" />
    </c>
  </grid>
</template>

<script>
import Color from "color";

export default {
  props: ["value"],

  created() {
    this.modelData = JSON.stringify(this.value.data);
  },

  computed: {
    modelData: {
      get() {
        return JSON.stringify(this.value.data);
      },

      set(value) {
        this.updateValue("data", JSON.parse(value));
      }
    },

    modelDirection: {
      get() {
        return this.value.direction;
      },

      set(value) {
        this.updateValue("direction", value);
      }
    },

    modelDuration: {
      get() {
        return this.value.duration;
      },

      set(value) {
        this.updateValue("duration", value);
      }
    },

    modelUseBpm: {
      get() {
        return this.value.useBpm;
      },

      set(value) {
        this.updateValue("useBpm", value);
      }
    },

    modelEasing: {
      get() {
        return this.value.easing;
      },

      set(value) {
        this.updateValue("easing", value);
      }
    },

    modelBpmDivision: {
      get() {
        return this.value.bpmDivision;
      },

      set(value) {
        this.updateValue("bpmDivision", value);
      }
    },

    modelDurationAsTotalTime: {
      get() {
        return this.value.durationAsTotalTime;
      },

      set(value) {
        this.updateValue("durationAsTotalTime", value);
      }
    },

    easings() {
      return this.$modV.store.state.tweens.easings;
    },

    modelSteps: {
      get() {
        return this.value.steps;
      },

      set(value) {
        return this.updateValue("steps", value);
      }
    }
  },

  methods: {
    updateValue(key, value) {
      this.$emit("input", { ...this.value, [key]: value });
    },

    getHexFromRgb(rgbArray) {
      return Color.rgb(rgbArray).hex();
    },

    updateModel(event, index) {
      const rgb = Color(event.target.value)
        .rgb()
        .array();
      const newColors = this.value.data.slice();
      newColors[index] = rgb;

      this.$emit("input", { ...this.value, data: newColors });
    },

    addSwatch() {
      const newColors = this.value.data.slice();
      newColors[newColors.length] = [0, 0, 0];

      this.$emit("input", { ...this.value, data: newColors });
    },

    removeSwatch(index) {
      const newColors = this.value.data.slice();
      newColors.splice(index, 1);

      this.$emit("input", { ...this.value, data: newColors });
    }
  }
};
</script>

<style scoped>
.swatches {
  display: flex;
}

.swatch {
  -webkit-appearance: none;
  border-radius: 50%;
  display: inline-block;
  height: 12px;
  width: 12px;
  margin: 3px;
  cursor: pointer;
  border: 2px solid #fff;

  transition: border-color 1200ms;
  padding: 0;
  box-sizing: content-box;
}

.swatch input {
  display: none;
}

.add-swatch {
  position: relative;
}

.add-swatch::before,
.add-swatch::after {
  content: "";
  background-color: #000;
  position: absolute;
  border-radius: 2px;
}

.add-swatch::before {
  width: 10px;
  height: 2px;
  top: 5px;
  left: 1px;
}

.add-swatch::after {
  width: 2px;
  height: 10px;
  top: 1px;
  left: 5px;
}
</style>
