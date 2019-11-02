<template>
  <grid columns="4">
    <c>
      <TweenControl v-model="localCache" />
    </c>
    <c>
      <button @click="makeLink">Make link</button>
    </c>
    <c>
      <button @click="removeLink" :disabled="!hasLink">Remove link</button>
    </c>
  </grid>
</template>

<script>
import hasLink from "../mixins/has-input-link";
import TweenControl from "../Controls/TweenControl";

export default {
  mixins: [hasLink],

  components: {
    TweenControl
  },

  props: {
    inputId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      localCache: null
    };
  },

  methods: {
    async makeLink() {
      const tween = await this.$modV.store.dispatch("data-types/createType", {
        type: "tween",
        args: this.localCache
      });

      this.$modV.store.dispatch("inputs/createInputLink", {
        inputId: this.inputId,
        type: "state",
        location: `tweens.tweens['${tween.id}'].value[0]`
      });
    },

    removeLink() {
      this.$modV.store.dispatch("inputs/removeInputLink", {
        inputId: this.inputId
      });
    }
  }
};
</script>

<style scoped></style>
