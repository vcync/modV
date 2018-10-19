<template>
  <div class="home">
    <div class="hero">
      <div class="hero-image-container">
        <transition name="fade" mode="in-out">
          <img class="capture-image" :key="capture" :src="`/captures/${capture}`">
        </transition>
        <img
          class="hero-image"
          v-if="data.heroImage"
          :src="$withBase(data.heroImage)"
          alt="hero"
        >
      </div>

      <h1>{{ data.heroText || $title || 'Hello' }}</h1>

      <p class="description">
        {{ data.tagline || $description || 'Welcome to your VuePress site' }}
      </p>

      <p
        class="action"
        v-if="data.actionText && data.actionLink"
      >
        <NavLink
          class="action-button"
          :item="actionLink"
        />
      </p>
    </div>

    <div
      class="features"
      v-if="data.features && data.features.length"
    >
      <div
        class="feature"
        v-for="feature in data.features"
      >
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.details }}</p>
      </div>
    </div>

    <Content custom/>

    <div
      class="footer"
      v-if="footer"
    >
      {{ footer }}
    </div>
  </div>
</template>

<script>
import NavLink from '../../../node_modules/vuepress/lib/default-theme/NavLink.vue'

export default {
  components: { NavLink },

  data() {
    return {
      captures: [],
      currentCapture: 0,
      footer: `MIT Licensed | Copyright © 2014-${(new Date()).getFullYear()} Sam Wray`,
    };
  },

  computed: {
    data() {
      return this.$page.frontmatter;
    },

    actionLink () {
      return {
        link: this.data.actionLink,
        text: this.data.actionText
      }
    },

    capture() {
      return this.captures[this.currentCapture];
    },
  },

  created() {
    this.captures = [
      '8.jpg',
      '7.jpg',
      '2.jpg',
      '4.jpg',
      '5.jpg',
      '6.jpg',
      '1.jpg',
      '3.jpg',
    ];

    this.currentCapture = 0;
  },

  mounted() {
    setInterval(this.rotateImage, 6000);
  },

  methods: {
    rotateImage() {
      if (this.currentCapture < this.captures.length - 1) {
        this.currentCapture += 1;
      } else {
        this.currentCapture = 0;
      }
    },
  },
}
</script>

<style lang="scss">
  .hero-image-container {
    border-radius: 50%;
    overflow: hidden;
    max-height: 280px;
    max-width: 280px;
    display: inline-flex;
    width: 100%;
    height: 100%;
    position: relative;

    margin: 3rem auto 1.5rem;

    img.capture-image {
      object-fit: cover;
      width: 100%;
      height: 100%;
      position: absolute;
      background-color: #000;
      margin: 0;
      transform: scale(1.5);
    }

    img.hero-image {
      margin: 0 !important;
      width: 100%;
      height: 100%;
      position: relative;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: all 4s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
