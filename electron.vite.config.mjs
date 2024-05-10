import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import rawPlugin from "vite-raw-plugin";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ["grid", "c"].includes(tag),
          },
        },
      }),
      svgLoader(),
      nodePolyfills({
        include: ["events"],
      }),
      rawPlugin({
        fileRegex: /\.(glsl|vert|frag|fs|vs)$/,
      }),
    ],
    worker: {
      format: "es",
    },
  },
});
