const CapitalizeFilter = {}

export default (CapitalizeFilter.install = Vue => {
  Vue.mixin({
    filters: {
      capitalize(valueIn) {
        let value = valueIn
        if (!value) return ''
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
      }
    }
  })
})
