<template>
  <div>
    <context-menu
      v-for="(menu, idx) in activeMenus"
      :key="idx"
      :options="menu"
    ></context-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Menu from './Menu'

export default {
  name: 'ContextMenuHandler',
  components: {
    contextMenu: Menu
  },
  data() {
    return {
      offsetWidth: 0,
      offsetHeight: 0
    }
  },
  computed: {
    ...mapGetters('contextMenu', ['activeMenus'])
  }
}
</script>

<style scoped lang="scss"></style>
