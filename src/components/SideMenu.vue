<template>
  <div id='menu' :class='{ open: menuState }'>
    <global-controls></global-controls>
  </div>
</template>

<script>
  import GlobalControls from '@/components/GlobalControls';

  export default {
    name: 'side-menu',
    props: {
      menuState: {
        default: false
      }
    },
    components: {
      GlobalControls
    },
  };
</script>

<style scoped lang='scss'>
  #menu {
    position: absolute;
    right: 0;
    top: 50px;
    width: 25%;
    max-width: 360px;
    min-width: 200px;
    bottom: 0;
    box-shadow: 0px 0px 0px 0px #000;
    background-color: #474747;
    transform: translate(100%, 0);
    transition: 300ms transform, 300ms box-shadow;
  }

  #menu.open {
    transform: translate(0, 0);
    box-shadow: 0px 0px 20px 0px #000;
  }
</style>