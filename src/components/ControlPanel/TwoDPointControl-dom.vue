<template>
  <div class="2d-point-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <div
      class='pad'
      ref='pad'
      @mousedown='mouseDown'
      @mouseup='mouseUp'
      @mousemove='mouseMove'
      @click='click'
    >
      <div class='point' ref='point'></div>
    </div>
    <div class="pure-form-message-inline">{{ value }}</div><br>
    <label>X: <input type='number' v-model='value[0]'></label>
    <label>Y: <input type='number' v-model='value[1]'></label>
  </div>
</template>

<script>
  export default {
    name: 'twoDPointControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        value: undefined,
        mousePressed: false,
        rawValue: [65.5, 65.5]
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
      min() {
        const min = isNaN(this.control.min) ? -2.0 : this.control.min;
        return min;
      },
      max() {
        const max = isNaN(this.control.max) ? 2.0 : this.control.max;
        return max;
      },
      step() {
        return this.control.step || 0.01;
      },
      defaultValue() {
        return this.control.default;
      },
      cssValue() {
        return `translateX(${this.rawValue[0] - 1}px) translateY(${this.rawValue[1] - 1}px)`;
      }
    },
    methods: {
      mapValues(x, y) {
        const mappedX = Math.map(x, 0, 131, this.min, this.max);
        const mappedY = Math.map(y, 131, 0, this.min, this.max);
        return [mappedX, mappedY];
      },
      unmapValues(x, y) {
        const unmappedX = Math.map(x, this.min, this.max, 0, 131);
        const unmappedY = Math.map(y, this.min, this.max, 131, 0);
        return [unmappedX, unmappedY];
      },
      mouseDown() {
        this.mousePressed = true;
      },
      mouseUp() {
        this.mousePressed = false;
      },
      mouseMove(e) {
        this.calculateValues(e);
      },
      click(e) {
        this.calculateValues(e, true);
      },
      calculateValues(e, clicked = false) {
        const rect = this.$refs.pad.getBoundingClientRect();
        const x = e.pageX - Math.round(rect.left);
        const y = e.pageY - Math.round(rect.top);

        if(this.mousePressed || clicked) {
          this.value = this.mapValues(x, y);
          this.rawValue = [x, y];
        }
      }
    },
    beforeMount() {
      this.value = this.module[this.variable];
      if(typeof this.value === 'undefined') this.value = this.defaultValue;
      this.rawValue = this.unmapValues(this.value[0], this.value[1]);
    },
    watch: {
      module() {
        this.value = this.module[this.variable];
        this.rawValue = this.unmapValues(this.value[0], this.value[1]);
      },
      value() {
        this.module[this.variable] = this.value;
      },
      rawValue() {
        this.$refs.point.style.transform = this.cssValue;
      }
    }
  };
</script>

<style scoped lang='scss'>
  input.pure-form-message-inline {
    max-width: 70px;
  }

  .pad {
    width: 130px;
    height: 130px;
    border: 1px solid #000;
    position: relative;
    background-color: #fff;
    cursor: crosshair;
  }

  .point {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background-color: #000;
    position: absolute;
    will-change: transform;
    transform: translateX(0px) translateY(0px);
  }
</style>