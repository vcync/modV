<template>
  <grid columns="4">
    <c span="1">Data</c>

    <c span="2">
      <Textarea v-model="modelData" :class="color" @change="updateValue" />
    </c>

    <c span="1+1">Easing</c>
    <c span="2">
      <Select
        v-model="modelEasing"
        :class="color"
        :disabled="!!modelSteps"
        @update:model-value="updateValue"
      >
        <option
          v-for="easing in easings"
          :key="easing.value"
          :value="easing.value"
        >
          {{ easing.label }}
        </option>
      </Select>
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
    <c
      ><Checkbox
        v-model="modelUseBpm"
        :class="color"
        emit-boolean
        @update:model-value="updateValue"
    /></c>

    <c span="1+1"><label :for="`${111}-bpmDivision`">BPM Division</label></c>
    <c span="2">
      <Select
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
      </Select>
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
export default {
  props: ["modelValue", "color"],
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
    };
  },

  computed: {
    easings() {
      return this.$modV.store.state.tweens.easings;
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
      if (!value) {
        this.setDefaultData();
      } else {
        this.setData(value);
      }
    },
  },

  created() {
    if (this.modelValue) {
      this.setDefaultData(this.modelValue);
    }
  },

  methods: {
    updateValue() {
      const data = this.modelData.length ? JSON.parse(this.modelData) : [];
      const duration = this.modelDuration;
      const easing = this.modelEasing;
      const useBpm = this.modelUseBpm;
      const bpmDivision = this.modelBpmDivision;
      const durationAsTotalTime = this.modelDurationAsTotalTime;
      const steps = this.modelSteps;

      this.$emit("update:modelValue", {
        ...this.modelValue,
        data,
        duration,
        easing,
        useBpm,
        bpmDivision,
        durationAsTotalTime,
        steps,
      });
    },

    setData(value) {
      this.modelData = value.data && JSON.stringify(value.data);
      this.modelDuration = value.duration;
      this.modelEasing = value.easing;
      this.modelUseBpm = value.useBpm;
      this.modelBpmDivision = value.bpmDivision;
      this.modelDurationAsTotalTime = value.durationAsTotalTime;
      this.modelSteps = value.steps;
    },

    setDefaultData() {
      this.setData({
        data: "",
        duration: 1000,
        easing: "linear",
        useBpm: true,
        bpmDivision: 32,
        durationAsTotalTime: false,
        steps: 0,
      });
    },
  },
};
</script>
