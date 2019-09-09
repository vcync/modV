<template>
  <div>
    <h1>palette</h1>
    <textarea v-model.lazy="modelData"></textarea><br />
    <input
      type="number"
      v-model="modelDuration"
      :disabled="modelUseBpm"
    /><br />
    <select v-model.number="modelEasing">
      <option
        v-for="easing in easings"
        :key="easing.value"
        :value="easing.value"
        >{{ easing.label }}</option
      > </select
    ><br />
    <label>Use BPM <input type="checkbox" v-model="modelUseBpm"/></label><br />
    <label :for="`${111}-bpmDivision`">BPM Division</label>
    <!-- <input
      :id="`${111}-bpmDivision`"
      v-model="modelBpmDivision"
      type="range"
      max="256"
      min="1"
      step="1"
    /> -->
    <select v-model.number="modelBpmDivision">
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
  </div>
</template>

<script>
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

    easings() {
      return this.$modV.store.state.tweens.easings;
    }
  },

  methods: {
    updateValue(key, value) {
      this.$emit("input", { ...this.value, [key]: value });
    }
  }
};
</script>
