export default {
  props: ['meta'],
  computed: {
    group() {
      return this.meta.$modv_group
    },

    groupName() {
      return this.meta.$modv_groupName
    },

    moduleName() {
      return this.meta.$modv_moduleName
    },

    inputId() {
      return `${this.moduleName}-${this.variable}`
    },

    value: {
      get() {
        if (this.meta.$modv_group || this.meta.$modv_groupName) {
          return this.$store.state.modVModules.active[this.moduleName][
            this.meta.$modv_groupName
          ].props[this.variable][this.meta.$modv_group]
        }

        return this.$store.state.modVModules.active[this.moduleName][
          this.variable
        ]
      },
      set(value) {
        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data: value,
          group: this.meta.$modv_group,
          groupName: this.meta.$modv_groupName
        })
      }
    },

    variable() {
      return this.meta.$modv_variable
    },

    label() {
      return this.meta.label || this.variable
    },

    defaultValue() {
      return this.meta.default
    },

    options() {
      return (
        (this.meta.control && this.meta.control.options) || this.meta.options
      )
    }
  }
}
