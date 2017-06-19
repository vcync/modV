<template>
  <div class="pure-u-6-24 gallery-item" @dblclick='doubleclick' draggable @dragstart='dragstart' :data-module-name='name'>
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
        raf: false,
        appendToName: '-gallery'
      };
    },
    props: [
      'ModuleIn',
      'moduleName'
    ],
    mounted() {
      this.canvas = this.$el.querySelector('canvas.preview');
      this.context = this.canvas.getContext('2d');

      this.createActiveModule({
        moduleName: this.moduleName,
        appendToName: this.appendToName,
        skipInit: true
      }).then((Module) => {
        this.Module = Module;
        if('init' in this.Module) this.Module.init({ width: this.canvas.width, height: this.canvas.height });
      });
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
        const features = this.$modV.meyda.get(this.$modV.audioFeatures);
        this.Module.draw(this.canvas, this.context, this.$modV.videoStream, features);
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
          moduleName: this.moduleName,
          skipInit: false
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