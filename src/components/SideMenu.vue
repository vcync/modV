<template>
  <div id="menu" :class="{ open: menuState }">
    <global-controls></global-controls>
  </div>
</template>

<script>
import GlobalControls from "@/components/GlobalControls";

export default {
  name: "SideMenu",
  components: {
    GlobalControls
  },
  props: {
    menuState: {
      default: false,
      type: Boolean
    }
  }
};
</script>

<style scoped lang="scss">
#menu {
  position: absolute;
  right: 0;
  top: 50px;
  width: 100%;
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
