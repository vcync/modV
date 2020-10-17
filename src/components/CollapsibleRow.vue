<template>
  <fragment>
    <c span="1.." class="label-row" v-if="hasLabelSlot">
      <grid columns="4">
        <c span="1"><slot name="label"/></c>
        <c span="3">
          <Button @mousedown="open = !open">Open/Close</Button>
        </c>
      </grid>
    </c>

    <slot name="body" v-if="open" />
  </fragment>
</template>

<script>
export default {
  data() {
    return {
      open: false
    };
  },

  computed: {
    hasLabelSlot() {
      return !!this.$slots.label;
    }
  }
};
</script>

<style scoped>
.label-row {
  border-bottom: 1px solid #9a9a9a;
}
</style>
