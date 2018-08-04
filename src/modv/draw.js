import { modV } from '@/modv';
import render2d from '@/modv/renderers/2d';
import { render as renderShader } from '@/modv/renderers/shader';
import { render as renderIsf } from '@/modv/renderers/isf';
import store from '@/../store';
import mux from './mux';

function draw(δ) {
  return new Promise((resolve) => {
    const layers = store.getters['layers/allLayers'];
    const audioFeatures = store.getters['meyda/features'];
    const previewValues = store.getters['size/previewValues'];

    const bufferCanvas = modV.bufferCanvas;
    const bufferContext = modV.bufferContext;

    if (!modV.meyda) return;
    const features = modV.meyda.get(audioFeatures);

    layers.forEach((Layer, LayerIndex) => {
      let canvas = Layer.canvas;
      const context = Layer.context;

      const clearing = Layer.clearing;
      const alpha = Layer.alpha;
      const enabled = Layer.enabled;
      const inherit = Layer.inherit;
      const inheritFrom = Layer.inheritFrom;
      const pipeline = Layer.pipeline;

      if (pipeline && clearing) {
        bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      }

      if (clearing) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (inherit) {
        let lastCanvas;

        if (inheritFrom < 0) {
          if (LayerIndex - 1 > -1) {
            lastCanvas = modV.layers[LayerIndex - 1].canvas;
          } else {
            lastCanvas = modV.outputCanvas;
          }
        } else {
          lastCanvas = modV.layers[inheritFrom].canvas;
        }

        context.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);

        if (pipeline) {
          bufferContext.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);
        }
      }

      if (!enabled || alpha === 0) return;

      Layer.moduleOrder.forEach((moduleName, moduleIndex) => {
        const Module = store.getters['modVModules/outerActive'][moduleName];

        if (!Module) return;

        if (!Module.meta.enabled || Module.meta.alpha === 0) return;

        if (pipeline && moduleIndex !== 0) {
          canvas = bufferCanvas;
        } else if (pipeline) {
          canvas = Layer.canvas;
        }

        if (Module.meta.type === '2d') {
          if (pipeline) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            render2d({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda._m, //eslint-disable-line
              delta: δ,
            });

            bufferContext.clearRect(0, 0, canvas.width, canvas.height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            render2d({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda._m, //eslint-disable-line
              delta: δ,
            });
          }
        }

        if (Module.meta.type === 'shader') {
          if (pipeline) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            renderShader({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });

            bufferContext.clearRect(0, 0, canvas.width, canvas.height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            renderShader({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });
          }
        }

        if (Module.meta.type === 'isf') {
          if (pipeline) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            renderIsf({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });

            bufferContext.clearRect(0, 0, canvas.width, canvas.height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            renderIsf({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });
          }
        }

        if (pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        }
      });
    });

    modV.webgl.regl.poll();

    mux().then(() => {
      modV.previewContext.clearRect(0, 0, modV.previewCanvas.width, modV.previewCanvas.height);
      modV.previewContext.drawImage(
        modV.outputCanvas,
        previewValues.x,
        previewValues.y,
        previewValues.width,
        previewValues.height,
      );
      resolve();
    });
  });
}

export default draw;
