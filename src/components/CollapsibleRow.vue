<template>
  <fragment>
    <c span="1.." class="label-row" :class="{ disabled }" v-if="hasLabelSlot">
      <grid columns="4">
        <c span="1"><slot name="label"/></c>
        <c span="3">
          <Button @mousedown="open = !open">
            <img
              :class="{ flip: !open }"
              src="../assets/graphics/Arrow-vertical.svg"
            />
          </Button>
        </c>
      </grid>
    </c>

    <slot name="body" v-if="!disabled && open" />
  </fragment>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

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

.label-row.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.flip {
  transform: scaleY(-1);
}
</style>
