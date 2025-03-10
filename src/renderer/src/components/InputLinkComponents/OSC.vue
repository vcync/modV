<template>
  <grid columns="4">
    <c span="1..">
      <grid columns="4">
        <c span="2+2">
          <Textarea v-model="oscLocation" @change="updateLocation" />
        </c>
      </grid>
    </c>
  </grid>
</template>

<script>
export default {
  props: {
    inputId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      oscLocation: "value",
    };
  },

  // watch: {
  //   inputId(inputId) {
  //     this.restoreExpressionValues(inputId);
  //   },
  // },

  // created() {
  //   this.restoreExpressionValues();
  // },

  computed: {
    inputConfig() {
      return this.$modV.store.state.inputs.inputLinks[this.inputId] || {};
    },

    hasLink() {
      const link = this.$modV.store.state.inputs.inputLinks[this.inputId];

      return link && link.source === "osc";
    },
  },

  methods: {
    async updateLocation() {
      const { oscLocation } = this;

      if (oscLocation.length === 0) {
        this.$modV.store.dispatch("inputs/removeInputLink", {
          inputId: this.inputId,
        });

        return;
      }

      await this.$modV.store.dispatch("inputs/createInputLink", {
        inputId: this.inputId,
        type: "state",
        source: "osc",
        location: oscLocation,
        min: null,
        max: null,
      });
    },
  },
};
</script>
