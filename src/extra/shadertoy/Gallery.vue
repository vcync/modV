<template>
  <div>
    <input type="text" @keypress.enter="search" class="input">
    <ul>
      <li
        class="is-light"
        v-for="result in results"
        @click="makeModule(result)"
      >{{ result.info.name }}</li>
    </ul>
  </div>
</template>

<script>
  import { modV } from '@/modv';
  import axios from 'axios';

  const appKey = 'rt8KwW';
  const url = 'https://www.shadertoy.com/api/v1';

  function getShaders(shaderIds) {
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

    return Promise.all(promises);
  }

  export default {
    name: 'ShadertoyGallery',
    data() {
      return {
        results: [],
      };
    },
    methods: {
      async search(e) {
        axios.get(`${url}/shaders/query/${e.target.value}`, {
          params: {
            key: appKey,
          },
        })
          .then(response => getShaders(response.data.Results))
          .then((shaders) => {
            this.results = shaders
              .map(response => response.data.Shader)
              .filter(shader => shader.renderpass.length < 2);
          });
      },
      makeModule(result) {
        const { code, inputs } = result.renderpass[0];
        let flipY = false;

        if (inputs.length) {
          flipY = inputs[0].sampler.vflip === 'true';
        }

        console.log(result, flipY);

        modV.register({
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
      },
    },
  };
</script>
