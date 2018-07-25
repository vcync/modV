<template>
  <div class="select-control" :data-moduleName='moduleName'>
    <b-field :label="label" :addons="false">
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
    </b-field>
  </div>
</template>

<script>
  export default {
    name: 'selectControl',
    props: [
      'module',
      'meta',
    ],
    computed: {
      moduleName() {
        return this.meta.$modv_moduleName;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      value: {
        get() {
          return this.$store.state.modVModules.active[this.moduleName][this.variable];
        },
        set(value) {
          this.$store.dispatch('modVModules/updateProp', {
            name: this.moduleName,
            prop: this.variable,
            data: value,
          });
        },
      },
      variable() {
        return this.meta.$modv_variable;
      },
      label() {
        return this.meta.label || this.variable;
      },
      enumVals() {
        return this.meta.enum;
      },
      selectedLabel() {
        if (typeof this.value === 'undefined') return -1;
        return this.meta.enum.find(enumValue => enumValue.value === this.value).label;
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
