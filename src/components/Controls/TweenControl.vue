<template>
  <div>
    <textarea v-model="modelData" @change="updateValue"></textarea>
    <input type="number" v-model="modelDuration" @change="updateValue" />
    <input type="text" v-model.number="modelEasing" @change="updateValue" />
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
  }
};
</script>
