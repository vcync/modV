<template>
  <div class="color-control" :data-moduleName="moduleName">
    <label :for="inputId">
      {{ label }}
    </label>
    <sketch-picker :id="inputId" ref="colorPicker" v-model="value" />
  </div>
</template>

<script>
import { Sketch } from 'vue-color'

export default {
  name: 'ColorControl',
  components: {
    'sketch-picker': Sketch
  },
  data() {
    return {
      pickerColors: {}
    }
  },
  computed: {
    value: {
      get() {
        return this.$store.state.modVModules.active[this.moduleName][
          this.variable
        ]
      },
      set(value) {
        const data = this[
          (this.options && this.options.returnFormat) || 'rgba'
        ](value)

        this.$store.dispatch('modVModules/updateProp', {
          name: this.moduleName,
          prop: this.variable,
          data
        })
      }
    },
    options() {
      return (
        (this.meta.control && this.meta.control.options) || this.meta.options
      )
    }
  },
  mounted() {
    this.$refs.colorPicker.inputChange(this.value)
    const data = this[(this.options && this.options.returnFormat) || 'rgba'](
      this.$refs.colorPicker.val
    )

    this.$store.dispatch('modVModules/updateProp', {
      name: this.moduleName,
      prop: this.variable,
      data
    })
  },
  methods: {
    rgbArray(value) {
      if (!('rgba' in value)) return [0, 0, 0]

      const rgba = value.rgba
      return [rgba.r, rgba.g, rgba.b]
    },

    rgbString(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0]

      const rgba = value.rgba

      return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
    },

    rgbaString(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0]

      const rgba = value.rgba

      return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
    },

    rgbaArray(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0]

      const rgba = value.rgba
      return [rgba.r, rgba.g, rgba.b, rgba.a]
    },

    rgba(value) {
      if (!('rgba' in value)) return { r: 0, g: 0, b: 0, a: 0 }

      return value.rgba
    },

    mappedRgbaArray(value) {
      if (!('rgba' in value)) return [0, 0, 0, 0]

      const rgba = value.rgba
      const red = Math.map(rgba.r, 0, 255, 0.0, 1.0)
      const green = Math.map(rgba.g, 0, 255, 0.0, 1.0)
      const blue = Math.map(rgba.b, 0, 255, 0.0, 1.0)
      const alpha = Math.map(rgba.a, 0, 1, 0.0, 1.0)

      return [red, green, blue, alpha]
    },

    hexString(value) {
      return value.hex
    },

    hsvArray(value) {
      if (!('hsv' in value)) return [0, 0, 0]

      const hsv = value.hsv
      return [hsv.r, hsv.g, hsv.b]
    },

    // hsvString(value) {

    // },

    hsvaArray(value) {
      if (!('hsv' in value)) return [0, 0, 0, 0]

      const hsva = value.hsv
      return [hsva.r, hsva.g, hsva.b, hsva.a]
    },

    // hsvaString(value) {

    // },

    hslArray(value) {
      if (!('hsl' in value)) return [0, 0, 0]

      const hsl = value.hsl
      return [hsl.r, hsl.g, hsl.b]
    },

    // hslString(value) {

    // },

    hslaArray(value) {
      if (!('hsl' in value)) return [0, 0, 0, 0]

      const hsla = value.hsl
      return [hsla.r, hsla.g, hsla.b, hsla.a]
    }

    // hslaString(value) {

    // },
  }
}
</script>

<style scoped lang="scss"></style>
