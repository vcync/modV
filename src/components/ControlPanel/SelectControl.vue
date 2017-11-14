<template>
  <div class="select-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <b-dropdown class="dropdown" v-model="value">
      <button class="button is-primary is-small" slot="trigger">
        <span>{{ selectedLabel | capitalize }}</span>
        <b-icon icon="angle-down"></b-icon>
      </button>

      <b-dropdown-item
        v-for="enumValue, idx in enumVals"
        :key="idx"
        :value="enumValue.value"
      >{{ enumValue.label | capitalize }}</b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
  export default {
    name: 'selectControl',
    props: [
      'module',
      'control',
    ],
    data() {
      return {
        value: undefined,
      };
    },
    computed: {
      moduleName() {
        return this.module.info.name;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      label() {
        return this.control.label;
      },
      variable() {
        return this.control.variable;
      },
      enumVals() {
        return this.control.enum;
      },
      grouped() {
        return this.control.grouped;
      },
      selectedLabel() {
        return this.control.enum.find(enumValue => enumValue.value === this.value).label;
      },
    },
    methods: {
      dropdownChanged(item) {
        this.value = item[0].value;
      },
    },
    beforeMount() {
      this.value = this.module[this.variable];
      if (typeof this.value === 'undefined') this.value = this.defaultValue;
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
      },
      value() {
        this.module[this.variable] = this.value;
      },
    },
  };
</script>

<style lang='scss'>
  .select-control-selector.hsy-dropdown {
      display: inline-block;
      vertical-align: middle;

    & > .selected {
      // height: 28px !important;
      // line-height: 28px !important;

      font-family: inherit;
      /* font-size: 100%; */
      padding: .5em 22px .5em 1em;
      color: #444;
      color: rgba(0,0,0,.8);
      border: 1px solid #999;
      border: 0 rgba(0,0,0,0);
      background-color: #E6E6E6;
      text-decoration: none;
      border-radius: 2px;
    }
  }
</style>
