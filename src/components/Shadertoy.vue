<template>
  <div class="shadertoy-gallery columns is-gapless is-multiline">
    <input
      v-model="keyword"
      type="text"
      class="input"
      placeholder="Type a keyword and press enter"
      @keypress.enter="search"
    />
    <div class="results">
      <table>
        <tbody>
          <tr v-for="result in results" :key="result.Shader.info.id">
            <td>
              {{ result.Shader.info.name }} by {{ result.Shader.info.username }}
              <hr />
              {{ result.Shader.info.description }}
            </td>
            <td>
              <Button class="light" @click="makeModule(result.Shader)">
                Add Shader to Gallery
              </Button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- <b-table
        pagination-class="is-light"
        :data="results"
        :columns="columns"
        :loading="loading"
        paginated
        backend-pagination
        :total="results.length"
        :per-page="perPage"
        @click="makeModule"
        @page-change="onPageChange"
      /> -->
    </div>
    <span v-if="loading"
      >Loading shader{{ results.length === 1 ? "" : "s" }}:
      {{ progress.toFixed(0) }}%</span
    >
  </div>
</template>

<script>
import path from "path";
import { fetchQuery } from "../util/fetch-query";
const appKey = "rt8KwW";
const url = "https://www.shadertoy.com/api/v1";

// https://stackoverflow.com/a/42342373
function allProgress(proms, progressCb) {
  let d = 0;
  progressCb(0);
  for (let i = 0, len = proms.length; i < len; i++) {
    const p = proms[i];

    p.then(() => {
      d += 1;
      progressCb((d * 100) / proms.length);
    });
  }
  return Promise.all(proms);
}

function getShaders(shaderIds, progressCb) {
  const promises = [];

  for (let i = 0, len = shaderIds.length; i < len; i++) {
    const id = shaderIds[i];

    promises.push(
      fetchQuery(`${url}/shaders/${id}`, {
        method: "POST",
        query: {
          key: appKey
        }
      })
    );
  }

  return allProgress(promises, progressCb);
}

export default {
  name: "ShadertoyGallery",
  data() {
    return {
      keyword: "",
      results: [],
      loading: false,
      progress: 0,

      page: 1,
      perPage: 40,

      columns: [
        {
          field: "info.name",
          label: "Name"
        }
      ]
    };
  },
  methods: {
    async search() {
      const { keyword, perPage } = this;
      let { page } = this;
      page -= 1;
      this.loading = true;
      this.progress = 0;
      this.results = [];

      const response = await fetchQuery(`${url}/shaders/query/${keyword}`, {
        method: "POST",
        query: {
          key: appKey,
          from: page * perPage,
          num: perPage
        }
      });

      const data = await response.json();

      const shaderResponses = await getShaders(data.Results, p => {
        this.progress = p;
      });

      this.loading = false;

      // Map input data to an Array of Promises
      const promises = shaderResponses.map(response => {
        return response.json();
      });

      // Wait for all Promises to complete
      const shaders = await Promise.all(promises);

      this.results = shaders.filter(
        shader => shader.Shader.renderpass.length < 2
      );

      console.log(this.results);
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
        flipY = inputs[0].sampler.vflip === "true";
      }

      const props = {};

      // Check if iMouse exists in the shader String
      if (code.indexOf("iMouse") > -1) {
        // Add uniforms to the shader
        code = `uniform float mX;
uniform float mY;
uniform float mZ;
uniform float mW;
vec4 iMouse = vec4(0.0, 0.0, 0.0, 0.0);
${code}`;

        // Find where mainImage is defined in the shader
        const mainImageMatch = /void(\s*?)mainImage((.|\n|\r)*?){/g.exec(code);

        // Calculate the injection position in the String
        const mainImagePosition =
          mainImageMatch.index + mainImageMatch[0].length;

        // Inject the iMouse replacement assignment
        code = `${code.substr(0, mainImagePosition)}
iMouse = vec4(mX * iResolution.x, mY * iResolution.y, mZ * iResolution.x, mW * iResolution.y);
${code.substr(mainImagePosition)}`;

        // Add props to the module as we know there's iMouse being used for input
        const mouseInputs = ["mX", "mY", "mZ", "mW"];

        for (let i = 0, len = mouseInputs.length; i < len; i++) {
          const input = mouseInputs[i];

          props[input] = {
            type: "float",
            default: 0.5,
            label: `Mouse ${input.slice(1, 2)}`
          };
        }
      }

      for (let i = 0; i < result.renderpass[0].inputs.length; i += 1) {
        const { ctype, src, channel } = result.renderpass[0].inputs[i];

        if (ctype === "texture") {
          const name = path.parse(src).name; // = "filename"
          const fileType = path.parse(src).ext; // = ".jpg"

          const response = await fetch(`https://www.shadertoy.com/${src}`, {
            cache: "no-cache",
            mode: "cors",
            credentials: "omit"
          });

          const payload = await response.arrayBuffer();

          await this.$modV.saveFile({
            what: "image",
            name,
            fileType: fileType.replace(".", ""),
            project: "default",
            payload: Buffer.from(payload)
          });

          props[`iChannel${channel}`] = {
            type: "texture",
            label: `iChannel${channel}`
          };
        }
      }

      await this.$modV.saveFile({
        what: "module",
        name: result.info.name,
        fileType: "js",
        project: "default",
        payload: `export default ${JSON.stringify({
          meta: {
            name: result.info.name,
            author: result.info.username,
            version: result.info.ver,
            uniforms: {},
            type: "shader",
            previewWithOutput: true,
            flipY
          },
          fragmentShader: code,
          props
        })}`
      });
    }
  }
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
  /* overflow: hidden; */
  flex: 1 1 auto;
  display: flex;
}

ul li {
  cursor: pointer;
}
</style>
