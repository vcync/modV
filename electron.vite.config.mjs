import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        include: ["webpack"],
      }),
    ],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
          outputWindow: resolve(__dirname, "src/renderer/output-window.html"),
          colorPicker: resolve(__dirname, "src/renderer/color-picker.html"),
          splashScreen: resolve(__dirname, "src/renderer/splash-screen.html"),
        },
        external: ["grandiose"],
      },
    },
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
    ],
    worker: {
      format: "es",
    },
  },
});
