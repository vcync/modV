<template>
  <div class="group-control">
    <b-field label="Group">
      <b-select v-model="currentGroup">
        <option v-for="index in groupLength" :key="index" :value="index - 1">{{
          index
        }}</option>
      </b-select>
      <button class="button" @click="addGroup">
        <b-icon icon="plus"></b-icon>
      </button>
      <button class="button" @click="removeGroup">
        <b-icon icon="minus"></b-icon>
      </button>
    </b-field>

    <component
      :is="control.component"
      v-for="control in controls"
      :key="`${control.meta.$modv_variable}${currentGroup}`"
      class="pure-control-group"
      :module="module"
      :meta="control.meta"
    ></component>
  </div>
</template>

<script>
import generateControlData from '@/components/ControlPanel/generate-control-data'

export default {
  name: 'GroupConrol',
  props: ['meta', 'module'],
  data() {
    return {
      currentGroup: 0
    }
  },
  computed: {
    group() {
      return this.$store.state.modVModules.active[this.meta.$modv_moduleName][
        this.meta.$modv_variable
      ]
    },
    groupProps() {
      return this.group.props
    },
    groupLength() {
      return this.group.length
    },
    controls() {
      return generateControlData({
        module: this.module,
        props: this.$store.state.modVModules.active[this.meta.$modv_moduleName]
          .props[this.meta.$modv_variable].props,
        exclude: ['group'],
        group: this.currentGroup,
        groupName: this.meta.$modv_variable
      })
    }
  },
  methods: {
    addGroup() {
      this.$store.commit('modVModules/incrementGroup', {
        moduleName: this.meta.$modv_moduleName,
        groupName: this.meta.$modv_variable
      })
    },
    removeGroup() {
      this.$store.commit('modVModules/decrementGroup', {
        moduleName: this.meta.$modv_moduleName,
        groupName: this.meta.$modv_variable
      })
    }
  }
}
</script>
