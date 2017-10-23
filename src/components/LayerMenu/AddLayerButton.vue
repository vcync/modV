<template>
  <!-- <div class="icon add-layer" @click='addLayer' title="Create New Layer">
    <span class="ibvf"></span>
    <i class="fa fa-plus" aria-hidden="true"></i>
  </div> -->
  <button class="button is-primary is-small" @click="addLayer" title="Create New Layer">
    <b-icon icon="plus"></b-icon>
  </button>
</template>

<script>
  import { mapActions } from 'vuex';

  export default {
    name: 'addLayerButton',
    methods: {
      ...mapActions('layers', [
        'addLayer'
      ])
    }
  };
</script>

<style scoped>
/*.icon {
  height: 22px;
  background-color: #ffa500;
  width: 22px;
  color: #fff;
  font-size: 0;
  display: inline-block;
  cursor: pointer;
  border-radius: 3px;
  vertical-align: middle;
  text-align: center;
}

.icon i.fa {
  font-size: 18px;
  vertical-align: middle;
  letter-spacing: 0;
}

.icon:not(:last-child) {
  margin: 0 5px 0 0;
}*/
</style>
