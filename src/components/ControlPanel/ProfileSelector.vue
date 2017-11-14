<template>
  <b-dropdown class="dropdown" v-model="currentProfile">
    <button class="button is-primary is-small" slot="trigger">
      <span>{{ currentProfile }}</span>
      <b-icon icon="angle-down"></b-icon>
    </button>

    <b-dropdown-item
      v-for="name, idx in profileNames"
      :key="idx"
      :value="name.value"
    >{{ name.label }}</b-dropdown-item>
  </b-dropdown>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'profileSelector',
    props: [
      'value',
    ],
    data() {
      return {
        currentProfile: 'default',
      };
    },
    computed: {
      ...mapGetters('profiles', [
        'allProfiles',
      ]),
      profileNames() {
        const data = [];
        const allProfiles = this.allProfiles;

        Object.keys(allProfiles).forEach((profileName) => {
          data.push({
            label: profileName,
            value: profileName,
            selected: this.currentProfile === profileName,
          });
        });

        return data;
      },
    },
    watch: {
      currentProfile() {
        this.$emit('input', this.currentProfile);
      },
    },
  };
</script>

<style lang='scss'>
  .profile-selector-container {
    display: inline-block;
  }

  .profile-selector.hsy-dropdown {
      display: inline-block;
      vertical-align: middle;

    & > .selected {
      // height: 28px !important;
      // line-height: 28px !important;

      font-family: inherit;
      /* font-size: 100%; */
      padding: .5em 22px .5em 1em;
      color: #444;
      color: rgba(0,0,0,.8);
      border: 1px solid #999;
      border: 0 rgba(0,0,0,0);
      background-color: #E6E6E6;
      text-decoration: none;
      border-radius: 2px;
    }
  }
</style>
