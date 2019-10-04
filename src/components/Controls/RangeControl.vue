<template>
  <div class="range-control" :data-moduleName="moduleName" v-context-menu="menuOptions">
    <b-field :label="label" :addons="false">
      <canvas
        class="control"
        ref="canvas"
        @mousedown="mouseDown"
        @touchstart="touchstart"
        @touchmove="touchmove"
        @touchend="touchend"
        @mousemove="mouseMove"
        @click="click"
      ></canvas>
      <b-input
        class="pure-form-message-inline"
        placeholder="Number"
        type="number"
        step="any"
        v-model.number="value"
      ></b-input>
    </b-field>
  </div>
</template>

<script>
  import { Menu, MenuItem } from 'nwjs-menu-browser';

  if (!window.nw) {
    window.nw = {
      Menu,
      MenuItem,
    };
  }

  const nw = window.nw;

  export default {
    name: 'rangeControl',
    data() {
      return {
        menuOptions: {
          match: ['rangeControl'],
          menuItems: [],
        },
        updateQueue: [],
        currentValue: 0,
        raf: null,
        lastLength: 0,
        context: null,
        mousePressed: false,
        canvasX: 0,
      };
    },
    computed: {
      min() {
        return this.meta.min || 0;
      },
      max() {
        return this.meta.max || 1;
      },
      step() {
        return this.meta.step || 1;
      },
      defaultValue() {
        return this.meta.default;
      },
      strict() {
        return this.meta.strict || false;
      },
    },
    methods: {
      mapValue(x) {
        const mappedX = Math.map(x, 0, 170, this.min, this.max);
        return this.formatValue(+mappedX.toFixed(2));
      },
      unmapValue(x) {
        const unmappedX = Math.map(x, this.min, this.max, 0, 170);
        return unmappedX;
      },
      mouseDown() {
        this.mousePressed = true;
      },
      mouseUp() {
        this.mousePressed = false;
      },
      mouseMove(e) {
        if (!this.mousePressed) return;
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
        const rect = this.$refs.canvas.getBoundingClientRect();
        let clientX;
        // let clientY;
        // let divisor = 1;

        if ('clientX' in e) {
          clientX = e.clientX;
          // clientY = e.clientY;
        } else {
          e.preventDefault();
          clientX = e.targetTouches[0].clientX;
          // clientY = e.targetTouches[0].clientY;
        }

        // if (
        //   clientY > rect.top + rect.height ||
        //   clientY < rect.top
        // ) {
        //   divisor = Math.max(1, Math.abs(clientY - rect.top) / 200);
        //   console.log(divisor, clientX, clientX / divisor);
        // }

        let x = /* ( */clientX/* / divisor) */ - Math.round(rect.left);

        if (this.meta.abs && x < 0) {
          x = 0;
        }

        if (this.mousePressed || clicked) {
          this.value = this.mapValue(x);
          // this.canvasX = x;
          // this.currentX = this.value;
        }
      },
      formatValue(valueIn) {
        let value = valueIn;

        if (this.strict) {
          if (value < this.min) {
            value = this.min;
          }

          if (value > this.max) {
            value = this.max;
          }

          if (this.varType === 'int') {
            value = parseInt(value, 10);
          }
        }

        return value;
      },
      draw() {
        const x = this.canvasX;
        const canvas = this.$refs.canvas;
        const context = this.context;

        context.fillStyle = '#393939';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (x > 0) {
          context.fillStyle = '#ffa500';
          context.fillRect(0, 0, x, canvas.height);
        } else {
          context.fillStyle = '#005aff';
          context.fillRect(0, 0, Math.abs(x), canvas.height);
        }
      },
    },
    beforeMount() {
      this.currentValue = this.processedValue || this.defaultValue;

      this.$data.menuOptions.menuItems.push(
        new nw.MenuItem({
          label: this.label,
          enabled: false,
        }),
        new nw.MenuItem({
          type: 'separator',
        }),
      );
    },
    mounted() {
      window.addEventListener('mouseup', this.mouseUp.bind(this));
      window.addEventListener('mousemove', this.mouseMove.bind(this));
      this.$refs.canvas.width = 170;
      this.$refs.canvas.height = 32;
      this.context = this.$refs.canvas.getContext('2d');
      this.canvasX = this.unmapValue(this.value);
      this.draw();
    },
    destroy() {
      window.removeEventListener('mouseup', this.mouseUp.bind(this));
      window.removeEventListener('mousemove', this.mouseMove.bind(this));
    },
    watch: {
      value(value) {
        this.canvasX = this.unmapValue(value);
      },
      canvasX() {
        this.draw();
      },
    },
  };
</script>

<style scoped lang='scss'>
  canvas {
    width: 170px;
    height: 36px;
    display: inline-block;
    vertical-align: top;
    cursor: col-resize;
    border-radius: 4px;
  }
</style>
