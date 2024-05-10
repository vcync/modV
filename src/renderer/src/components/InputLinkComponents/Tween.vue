<template>
  <div>
    <TweenControl
      v-model="localCache"
      color="light"
      @update:model-value="manageLink"
    />
  </div>
</template>

<script>
import TweenControl from "../Controls/TweenControl.vue";

export default {
  components: {
    TweenControl,
  },

  props: {
    inputId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      localCache: null,
    };
  },

  computed: {
    hasLink() {
      return !!this.$modV.store.state.inputs.inputLinks[this.inputId];
    },
  },

  watch: {
    inputId() {
      this.refreshCache();
    },
  },

  mounted() {
    this.refreshCache();
  },

  methods: {
    refreshCache() {
      if (this.hasLink) {
        this.localCache = this.$modV.store.state.tweens.tweens[this.inputId];
      } else {
        this.localCache = null;
      }
    },

    manageLink() {
      if (this.hasLink && this.localCache.data.length) {
        this.removeLink();
        this.makeLink();
      } else if (this.hasLink && !this.localCache.data.length) {
        this.removeLink();
      } else {
        this.makeLink();
      }
    },

    async makeLink() {
      const tween = await this.$modV.store.dispatch("dataTypes/createType", {
        type: "tween",
        args: {
          id: this.inputId,
          ...JSON.parse(JSON.stringify(this.localCache)),
        },
      });

      await this.$modV.store.dispatch("inputs/createInputLink", {
        inputId: this.inputId,
        type: "state",
        location: `tweens.tweens['${tween.id}'].value[0]`,
        source: "tween",
      });
    },

    removeLink() {
      this.$modV.store.dispatch("inputs/removeInputLink", {
        inputId: this.inputId,
      });
    },
  },
};
</script>
import { nextTick } from "vue";
