<template>
  <div>
    <h1>palette</h1>
    <textarea v-model="modelData" @change="updateValue"></textarea>
    <input type="number" v-model="modelDuration" @change="updateValue" />
    <select v-model.number="modelEasing" @change="updateValue">
      <option v-for="easing in easings" :key="easing" :value="easing">{{
        easing
      }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: ["value"],
  data() {
    return {
      modelData: "",
      modelDuration: 1000,
      modelEasing: "linear"
    };
  },

  created() {
    this.modelData = JSON.stringify(this.value.data);
  },

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

      this.$emit("input", { ...this.value, data, duration, easing });
    }
  }
};
</script>
