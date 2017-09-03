<template>
  <div class="range-control" :data-moduleName='moduleName' v-context-menu='menuOptions'>
    <label :for='inputId'>
      {{ label }}
    </label>
    <!-- <input
      :id='inputId'
      type='range'
      :min='min'
      :max='max'
      :step='step'
      v-model='currentValue'
      @input='numberInput'
    > -->
    <canvas
      :id='inputId'
      ref='canvas'
      @mousedown='mouseDown'

      @click='click'
    ></canvas>
    <!-- @mousemove='mouseMove' -->
    <input
        class="pure-form-message-inline"
        type='number'
        v-model='currentValue'
        step='any'
        @input='numberInput'
      >
  </div>
</template>

<script>
  import { mapGetters, mapMutations } from 'vuex';
  import { Menu, MenuItem } from 'nwjs-menu-browser';

  if(!window.nw) {
    window.nw = {
      Menu,
      MenuItem
    };
  }

  const nw = window.nw;

  export default {
    name: 'rangeControl',
    props: [
      'module',
      'control'
    ],
    data() {
      return {
        menuOptions: {
          match: ['rangeControl'],
          menuItems: []
        },
        valueIn: 0,
        updateQueue: [],
        currentValue: 0,
        raf: null,
        lastLength: 0,
        context: null,
        mousePressed: false,
        value: 0,
        canvasX: 0
      };
    },
    computed: {
      processedValue() {
        return this.getValueFromActiveModule(this.moduleName, this.variable).processed;
      },
      ...mapGetters('modVModules', [
        'getValueFromActiveModule'
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
      varType() {
        return this.control.varType;
      },
      min() {
        return this.control.min;
      },
      max() {
        return this.control.max;
      },
      step() {
        return this.control.step;
      },
      defaultValue() {
        return this.control.default;
      }
    },
    methods: {
      ...mapMutations('modVModules', [
        'setActiveModuleControlValue'
      ]),
      numberInput(e) {
        this.$data.valueIn = e.target.value;
      },
      mapValue(x) {
        const mappedX = Math.map(x, 0, 170, this.min, this.max);
        return +mappedX.toFixed(2);
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
        if(!this.mousePressed) return;
        this.calculateValues(e);
      },
      click(e) {
        this.calculateValues(e, true);
      },
      calculateValues(e, clicked = false) {
        const rect = this.$refs.canvas.getBoundingClientRect();
        const x = e.clientX - Math.round(rect.left);

        if(this.mousePressed || clicked) {
          this.valueIn = this.mapValue(x);
          this.currentValue = this.valueIn;
          this.canvasX = x;
          this.currentX = this.value;
        }
      },
      draw() {
        const x = this.canvasX;
        const canvas = this.$refs.canvas;
        const context = this.context;

        context.fillStyle = '#393939';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#ef8d00';
        context.fillRect(0, 0, x, canvas.height);
      }
    },
    beforeMount() {
      this.$data.currentValue = this.processedValue;

      this.$data.menuOptions.menuItems.push(
        new nw.MenuItem({
          label: this.label,
          enabled: false
        }),
        new nw.MenuItem({
          type: 'separator'
        })
      );
    },
    mounted() {
      window.addEventListener('mouseup', this.mouseUp.bind(this));
      window.addEventListener('mousemove', this.mouseMove.bind(this));
      this.$refs.canvas.width = 170;
      this.$refs.canvas.height = 32;
      this.context = this.$refs.canvas.getContext('2d');
      this.canvasX = this.unmapValue(this.currentValue);
      this.draw();
    },
    destroy() {
      window.removeEventListener('mouseup', this.mouseUp.bind(this));
      window.removeEventListener('mousemove', this.mouseMove.bind(this));
    },
    watch: {
      valueIn() {
        const value = this.valueIn;

        let val;
        if(this.varType === 'int') val = parseInt(value, 10);
        else if(this.varType === 'float') val = parseFloat(value, 10);
        this.setActiveModuleControlValue({
          moduleName: this.moduleName,
          variable: this.variable,
          value: val
        });
      },
      processedValue() {
        this.currentValue = this.processedValue;
        this.canvasX = this.unmapValue(this.currentValue);
      },
      canvasX() {
        this.draw();
      }
    }
  };
</script>

<style scoped lang='scss'>
  canvas {
    width: 170px;
    height: 32px;
    display: inline-block;
    vertical-align: top;
    cursor: col-resize;
    border-radius: 4px;
  }

  input.pure-form-message-inline {
    max-width: 70px;
  }
</style>