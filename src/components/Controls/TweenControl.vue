<template>
  <div>
    <textarea v-model="modelData" @change="updateValue"></textarea>
    <input
      type="number"
      v-model="modelDuration"
      @change="updateValue"
      :disabled="useBpm"
    />
    <select
      v-model="modelEasing"
      @change="updateValue"
      :disabled="!!modelSteps"
    >
      <option
        v-for="easing in easings"
        :key="easing.value"
        :value="easing.value"
        >{{ easing.label }}</option
      >
    </select>
    <br />
    <label
      title="If unchecked the duration will be used per step. duration * numberOfSteps"
      >Use duration as total time?
      <input
        type="checkbox"
        v-model="modelDurationAsTotalTime"
        @change="updateValue"/></label
    ><br />
    <label
      >Use BPM<input
        type="checkbox"
        v-model="useBpm"
        @change="updateValue"/></label
    ><br />
    <label for="bpmDivision">BPM Division</label>
    <select v-model.number="modelBpmDivision" @change="updateValue">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="4">4</option>
      <option value="8">8</option>
      <option value="16">16</option>
      <option value="32">32</option>
      <option value="64">64</option>
      <option value="128">128</option>
      <option value="256">256</option>
    </select>
    <br />
    <label
      title="If greater than 0 step mode will be enabled, which steps a linear animation over the given amount of steps"
      >Steps<input
        type="number"
        v-model.number="modelSteps"
        @change="updateValue"
    /></label>
  </div>
</template>

<script>
export default {
  props: ["value"],
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

  // computed: {
  //   inputData: {
  //     get() {
  //       return JSON.stringify(this.value.data);
  //     },
  //     set(value) {
  //       this.modelData = value;
  //     }
  //   }
  // },

  computed: {
    easings() {
      return this.$modV.store.state.tweens.easings;
    }
  },

  methods: {
    updateValue() {
      const data = JSON.parse(this.modelData);
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
