<template>
  <grid columns="4">
    <c span="1">Data</c>

    <c span="2">
      <Textarea :class="color" v-model="modelData" @change="updateValue" />
    </c>

    <c span="1+1">Easing</c>
    <c span="2">
      <Select
        :class="color"
        v-model.number="modelEasing"
        :disabled="!!modelSteps"
        @input="updateValue"
      >
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
      <Number
        :class="color"
        v-model="modelDuration"
        :disabled="modelUseBpm"
        @input="updateValue"
      />
    </c>

    <c span="1+1">Use BPM</c>
    <c><Checkbox :class="color" v-model="modelUseBpm" @input="updateValue"/></c>

    <c span="1+1"><label :for="`${111}-bpmDivision`">BPM Division</label></c>
    <c span="2">
      <Select
        :class="color"
        v-model.number="modelBpmDivision"
        @input="updateValue"
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
        :class="color"
        v-model="modelDurationAsTotalTime"
        @input="updateValue"
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
      <Number :class="color" v-model.number="modelSteps" @input="updateValue" />
    </c>
  </grid>
</template>

<script>
export default {
  props: ["value", "color"],

  data() {
    return {
      modelData: "",
      modelDuration: 1000,
      modelEasing: "linear",
      useBpm: true,
      modelBpmDivision: 32,
      modelDurationAsTotalTime: false,
      modelSteps: 0
    };
  },

  created() {
    if (this.value) {
      this.modelData = JSON.stringify(this.value.data);
    }
  },

  computed: {
    easings() {
      return this.$modV.store.state.tweens.easings;
    }
  },

  methods: {
    updateValue() {
      const data = this.modelData.length ? JSON.parse(this.modelData) : [];
      const duration = this.modelDuration;
      const easing = this.modelEasing;
      const useBpm = this.useBpm;
      const bpmDivision = this.modelBpmDivision;
      const durationAsTotalTime = this.modelDurationAsTotalTime;
      const steps = this.modelSteps;

      this.$emit("input", {
        ...this.value,
        data,
        duration,
        easing,
        useBpm,
        bpmDivision,
        durationAsTotalTime,
        steps
      });
    }
  },

  watch: {
    "$store.state.bpm"(value) {
      if (this.useBpm) {
        this.modelDuration = value / this.modelBpmDivision;
        this.updateValue();
      }
    }
  }
};
</script>
