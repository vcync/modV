<template>
  <div class="2d-point-control" :data-moduleName='moduleName'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <div style='display: inline-block'>
      <canvas
        class='pad'
        ref='pad'
        @mousedown='mouseDown'
        @mouseup='mouseUp'
        @mousemove='mouseMove'
        @touchstart='touchstart'
        @touchmove='touchmove'
        @touchend='touchend'
        @click='click'
      ></canvas>
      <br>
      <label>X: <input type='number' v-model='currentX' @input='xInput'></label>
      <br>
      <label>Y: <input type='number' v-model='currentY' @input='yInput'></label>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'twoDPointControl',
    props: [
      'module',
      'control',
    ],
    data() {
      return {
        context: null,
        value: undefined,
        mousePressed: false,
        canvasCoords: [65.5, 65.5],
        currentX: 0,
        currentY: 0,
        inputX: 0,
        inputY: 0,
      };
    },
    computed: {
      ...mapGetters('modVModules', [
        'getValueFromActiveModule',
      ]),
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
        let min = isNaN(this.control.min) ? -1.0 : this.control.min;
        min = Array.isArray(this.control.min) ? this.control.min[0] : min;
        return min;
      },
      max() {
        let max = isNaN(this.control.max) ? 1.0 : this.control.max;
        max = Array.isArray(this.control.max) ? this.control.max[0] : max;
        return max;
      },
      step() {
        return this.control.step || 0.01;
      },
      defaultValue() {
        return this.control.default;
      },
    },
    methods: {
      ...mapActions('modVModules', [
        'setActiveModuleControlValue',
      ]),
      mapValues(x, y) {
        const mappedX = Math.map(x, 0, 130, this.min, this.max);
        const mappedY = Math.map(y, 130, 0, this.min, this.max);
        return [+mappedX.toFixed(2), +mappedY.toFixed(2)];
      },
      unmapValues(x, y) {
        const unmappedX = Math.map(x, this.min, this.max, 0, 130);
        const unmappedY = Math.map(y, this.min, this.max, 130, 0);
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
      touchstart() {
        this.mousePressed = true;
      },
      touchmove(e) {
        this.calculateValues(e);
      },
      touchend() {
        this.mousePressed = false;
      },
      click(e) {
        this.calculateValues(e, true);
      },
      calculateValues(e, clicked = false) {
        const rect = this.$refs.pad.getBoundingClientRect();

        let clientX;

        if ('clientX' in e) {
          clientX = e.clientX;
        } else {
          e.preventDefault();
          clientX = e.targetTouches[0].clientX;
        }

        let clientY;

        if ('clientY' in e) {
          clientY = e.clientY;
        } else {
          clientY = e.targetTouches[0].clientY;
        }

        const x = clientX - Math.round(rect.left);
        const y = clientY - Math.round(rect.top);

        if (this.mousePressed || clicked) {
          this.value = this.mapValues(x, y);
          this.canvasCoords = [x, y];
          this.currentX = this.value[0];
          this.currentY = this.value[1];
        }
      },
      draw(x, y) {
        const canvas = this.$refs.pad;
        const context = this.context;

        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        this.drawGrid();
        this.drawPosition(x, y);
      },
      drawGrid() {
        const canvas = this.$refs.pad;
        const context = this.context;
        const width = canvas.width;
        const height = canvas.height;
        // const ch = canvas.height;

        context.save();
        context.strokeStyle = '#aaa';
        context.beginPath();
        context.lineWidth = 1;
        const sections = 20;
        const step = width / sections;
        for (let i = 0; i < sections; i += 1) {
          context.moveTo(i * step, 0);
          context.lineTo(i * step, height);
          context.moveTo(0, i * step);
          context.lineTo(width, i * step);
        }
        context.stroke();
        context.restore();
      },
      drawPosition(x, y) {
        const canvas = this.$refs.pad;
        const context = this.context;

        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI, true);
        context.strokeStyle = '#000';
        context.stroke();

        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();

        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      },
      xInput(e) {
        this.inputX = parseFloat(e.target.value);
      },
      yInput(e) {
        this.inputY = parseFloat(e.target.value);
      },
    },
    beforeMount() {
      this.value = this.module[this.variable];
      if (typeof this.value === 'undefined') this.value = this.defaultValue;
      this.canvasCoords = this.unmapValues(this.value[0], this.value[1]);
    },
    mounted() {
      this.$refs.pad.width = 130;
      this.$refs.pad.height = 130;
      this.context = this.$refs.pad.getContext('2d');
      this.canvasCoords = this.unmapValues(this.value[0], this.value[1]);
    },
    watch: {
      /* module() {
        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value: this.value
        });
        this.canvasCoords = this.unmapValues(this.value[0], this.value[1]);
      }, */
      value() {
        this.currentX = this.value[0];
        this.currentY = this.value[1];
        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value: this.value,
        });
      },
      canvasCoords() {
        this.draw(this.canvasCoords[0], this.canvasCoords[1]);
      },
      inputX() {
        const value = this.inputX;

        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value: [value, this.inputY],
        });
        this.canvasCoords = this.unmapValues(value, this.inputY);
      },
      inputY() {
        const value = this.inputY;

        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value: [this.inputX, value],
        });
        this.canvasCoords = this.unmapValues(this.inputX, value);
      },
    },
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
