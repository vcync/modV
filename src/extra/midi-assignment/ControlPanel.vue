<template>
  <div class="columns is-multiline">
    <div class="column is-12">
      Devices:
    </div>

    <div
      v-for="(device, deviceName) in devices"
      :key="deviceName"
      class="column is-12"
    >
      {{ deviceName }}
    </div>

    <div class="column is-12">
      Assignments:
    </div>

    <div
      v-for="assignment in assignments"
      :key="assignment"
      class="column is-12"
    >
      {{ assignment }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MidiAssignmentPluginControlPanel',
  computed: {
    ...mapGetters('midiAssignment', ['assignments', 'devices'])
  }
}
</script>

<style lang="scss"></style>
