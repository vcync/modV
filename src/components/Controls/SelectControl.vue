<template>
  <div class="select-control" :data-moduleName="moduleName">
    <b-field :label="label" :addons="false">
      <b-dropdown v-model="value" class="dropdown">
        <button slot="trigger" class="button is-primary is-small">
          <span>{{ selectedLabel | capitalize }}</span>
          <b-icon icon="angle-down"></b-icon>
        </button>

        <b-dropdown-item
          v-for="(enumValue, idx) in enumVals"
          :key="idx"
          :value="enumValue.value"
          >{{ enumValue.label | capitalize }}</b-dropdown-item
        >
      </b-dropdown>
    </b-field>
  </div>
</template>

<script>
export default {
  name: "SelectControl",
  computed: {
    enumVals() {
      return this.meta.enum;
    },
    selectedLabel() {
      if (typeof this.value === "undefined") return -1;
      return this.meta.enum.find(enumValue => enumValue.value === this.value)
        .label;
    }
  }
};
</script>
