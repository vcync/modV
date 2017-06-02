<template>
  <div class="pure-u-6-24 gallery-item" @dblclick='doubleclick' draggable @dragstart='dragstart'>
    <canvas class="preview" @mouseout='mouseout' @mouseover='mouseover'></canvas>
    <div class="title-wrapper">
      <span class="title">{{ name }}</span>
      <span class="ibvf"></span>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';

  export default {
    name: 'galleryItem',
    data() {
      return {
        canvas: false,
        context: false,
        Module: false,
        raf: false
      };
    },
    props: [
      'ModuleIn'
    ],
    mounted() {
      this.canvas = this.$el.querySelector('canvas.preview');
      this.context = this.canvas.getContext('2d');

      this.Module = new this.ModuleIn();
      if('init' in this.Module) this.Module.init({ width: 50, height: 50 });
    },
    methods: {
      ...mapActions('layers', [
        'addModuleToLayer'
      ]),
      ...mapActions('modVModules', [
        'createActiveModule'
      ]),
      draw() {
        this.raf = requestAnimationFrame(this.draw);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.Module.draw(this.canvas, this.context);
      },
      mouseover(e) {
        if(!e.target.classList.contains('preview')) return;
        if(this.raf) return;
        this.raf = requestAnimationFrame(this.draw);
      },
      mouseout(e) {
        if(!e.target.classList.contains('preview')) return;
        cancelAnimationFrame(this.raf);
        this.raf = false;
      },
      doubleclick() {
        this.createActiveModule({
          moduleName: this.Module.info.name
        }).then((Module) => {
          this.addModuleToLayer({
            module: Module,
            layerIndex: this.focusedLayer
          });
        });
      },
      dragstart(e) {
        e.dataTransfer.setData('module-name', this.Module.info.name);
      }
    },
    computed: {
      ...mapGetters('layers', [
        'focusedLayer'
      ]),
      name() {
        const Module = this.Module;
        if (!Module) return '';
        if (!('info' in Module)) return '';
        if (!('name' in Module.info)) return '';
        return Module.info.name;
      }
    }
  };
</script>

<style lang='scss' scoped>
  .gallery-item {
    &:hover {
      cursor: move;
    }
  }
</style>