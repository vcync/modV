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
        const { inputs } = result.renderpass[0];
        let { code } = result.renderpass[0];
        let flipY = false;

        if (inputs.length) {
          flipY = inputs[0].sampler.vflip === 'true';
        }

        const props = {};

        // Check if iMouse exists in the shader String
        if (code.indexOf('iMouse') > -1) {
          // Add uniforms to the shader
          code = `uniform float mX;\nuniform float mY;\nuniform float mZ;\nuniform float mW;\n${code}`;

          // Find where mainImage is defined in the shader
          const mainImageMatch = /void(\s*?)mainImage((.|\n|\r)*?){/g.exec(code);

          // Calculate the injection position in the String
          const mainImagePosition = mainImageMatch.index + mainImageMatch[0].length;

          // Inject the iMouse replacement assignment
          code = `${code.substr(0, mainImagePosition)}\nvec4 iMouse = vec4(mX * iResolution.x, mY * iResolution.y, mZ * iResolution.x, mW * iResolution.y);\n${code.substr(mainImagePosition)}`;

          // Add props to the module as we know there's iMouse being used for input
          const mouseInputs = ['mX', 'mY', 'mZ', 'mW'];

          mouseInputs.forEach((input) => {
            props[input] = {
              type: 'float',
              default: 0.5,
              label: `Mouse ${input.slice(1, 2)}`,
            };
          });
        }

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
          props,
        });
      },
    },
  };
</script>
