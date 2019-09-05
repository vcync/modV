<template>
  <div>
    <textarea v-model="modelData" @change="updateValue"></textarea>
    <input
      type="number"
      v-model="modelDuration"
      @change="updateValue"
      :disabled="useBpm"
    />
    <input type="text" v-model.number="modelEasing" @change="updateValue" />
    <label :for="`${inputId}-bpmDivision`">BPM Division</label>
    <input
      :id="`${inputId}-bpmDivision`"
      v-model="bpmDivisionInput"
      type="range"
      max="32"
      min="1"
      step="1"
    />
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
      useBpm: true
    };
  },

  created() {
    this.modelData = JSON.stringify(this.value.data);
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

  methods: {
    updateValue() {
      const data = JSON.parse(this.modelData);
      const duration = this.modelDuration;
      const easing = this.modelEasing;

      this.$emit("input", { ...this.value, data, duration, easing });
    }
  },

  watch: {
    "$store.state.bpm"(value) {
      if (this.useBpm) {
        this.modelDuration = value / 60000;
        this.updateValue();
      }
    }
  }
};
</script>
