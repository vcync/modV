<template>
  <div class="shadertoy-gallery columns is-gapless is-multiline">
    <input type="text" @keypress.enter="newSearch" v-model="keyword" class="input" placeholder="Type a keyword and press enter">
    <div v-bar="{ useScrollbarPseudo: true }" class="results" ref="scroller">
      <b-table
        pagination-class="is-light"
        :data="results"
        :columns="columns"
        @click="makeModule"

        :loading="loading"

        paginated
        backend-pagination
        :total="total"
        :per-page="perPage"
        @page-change="onPageChange"
      />
    </div>
    <span v-if="loading">Loading shader{{ total === 1 ? '' : 's' }}: {{ progress.toFixed(2) }}%</span>
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
        keyword: '',
        results: [],
        loading: false,
        progress: 0,
        total: '?',

        page: 1,
        perPage: 40,

        columns: [
          {
            field: 'info.name',
            label: 'Name',
          },
        ],
      };
    },
    methods: {
      async newSearch() {
        await this.getTotal();
        await this.search();
      },

      async getTotal() {
        const response = await axios.get(`${url}/shaders/query/${this.keyword}`, {
          params: {
            key: appKey,
          },
        });

        this.total = response.data.Results.length;
      },

      async search() {
        const { keyword, page, perPage } = this;
        this.loading = true;
        this.progress = 0;
        this.results = [];

        const response = await axios.get(`${url}/shaders/query/${keyword}`, {
          params: {
            key: appKey,
            from: page * perPage,
            num: perPage,
          },
        });

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

      onPageChange(page) {
        this.page = page;
        this.search();
      },

      async makeModule(result) {
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
          props,
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
