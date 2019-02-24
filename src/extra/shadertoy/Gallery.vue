<template>
  <div class="shadertoy-gallery columns is-gapless is-multiline">
    <input type="text" @keypress.enter="search" class="input" placeholder="Type a keyword and press enter">
    <span v-if="loading">Requesting info for {{ foundLength }} shader{{ foundLength === 1 ? '' : 's' }}: {{ progress.toFixed(2) }}%</span>

    <div v-bar="{ useScrollbarPseudo: true }" class="results" ref="scroller">
      <ul v-show="!loading">
        <li
          class="is-light"
          v-for="result in results"
          @click="makeModule(result)"
          :key="result.info.id"
        >{{ result.info.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import { modV } from '@/modv';
  import axios from 'axios';

  const appKey = 'rt8KwW';
  const url = 'https://www.shadertoy.com/api/v1';

  // https://stackoverflow.com/a/42342373
  function allProgress(proms, progressCb) {
    let d = 0;
    progressCb(0);
    proms.forEach((p) => {
      p.then(() => {
        d += 1;
        progressCb((d * 100) / proms.length);
      });
    });
    return Promise.all(proms);
  }

  function getShaders(shaderIds, progressCb) {
    const promises = [];

    shaderIds.forEach((id) => {
      promises.push(
        axios.get(`${url}/shaders/${id}`, {
          params: {
            key: appKey,
          },
        }),
      );
    });

    return allProgress(promises, progressCb);
  }

  export default {
    name: 'ShadertoyGallery',
    data() {
      return {
        results: [],
        loading: false,
        progress: 0,
        foundLength: '?',
      };
    },
    methods: {
      async search(e) {
        this.loading = true;
        this.progress = 0;
        this.foundLength = '?';
        const response = await axios.get(`${url}/shaders/query/${e.target.value}`, {
          params: {
            key: appKey,
          },
        });

        this.foundLength = response.data.Results.length;

        const shaders = await getShaders(response.data.Results, (p) => {
          this.progress = p;
        });

        this.loading = false;
        this.results = shaders
          .map(response => response.data.Shader)
          .filter(shader => shader.renderpass.length < 2);

        this.$nextTick(() => {
          this.$vuebar.refreshScrollbar(this.$refs.scroller);
        });
      },
      async makeModule(result) {
        const { code, inputs } = result.renderpass[0];
        let flipY = false;

        if (inputs.length) {
          flipY = inputs[0].sampler.vflip === 'true';
        }

        console.log(result, flipY);

        await modV.register({
          meta: {
            name: result.info.name,
            author: result.info.username,
            version: 0.1,
            uniforms: {},
            type: 'shader',
            previewWithOutput: true,
            flipY,
          },
          fragmentShader: code,
        });

        this.$toast.open({
          message: `Added ${result.info.name} to the Module Gallery`,
          type: 'is-success',
        });
      },
    },
  };
</script>

<style scoped>
.shadertoy-gallery {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;
  height: 100%;
}

.results {
  width: 100%;
  position: relative;
  overflow: hidden;
  flex: 1 1 auto;
  display: flex;
}

ul li {
  cursor: pointer;
}
</style>
