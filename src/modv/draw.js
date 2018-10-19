import { modV } from '@/modv';
// import render2d from '@/modv/renderers/2d';
// import { render as renderShader } from '@/modv/renderers/shader';
// import { render as renderIsf } from '@/modv/renderers/isf';
import store from '@/store';
import mux from './mux';

function getBufferCanvas() {
  return {
    canvas: modV.bufferCanvas,
    context: modV.bufferContext,
  };
}

function renderRenderer({
  canvas,
  context,
  renderFunction,
  renderContext,
  pipeline = false,
  layer,
}) {
  const { canvas: bufferCanvas, context: bufferContext } = getBufferCanvas();
  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      bufferCanvas,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    renderFunction(renderContext);

    bufferContext.clearRect(0, 0, canvas.width, canvas.height);
    bufferContext.drawImage(
      layer.canvas,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  } else {
    renderFunction(renderContext);
  }
}

function draw(δ) {
  return new Promise((resolve) => {
    const renderers = store.state.renderers;
    const availableRenderers = Object.keys(renderers);

    const layers = store.getters['layers/allLayers'];
    const audioFeatures = store.getters['meyda/features'];
    const previewValues = store.getters['size/previewValues'];

    const { canvas: bufferCanvas, context: bufferContext } = getBufferCanvas();

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

        const moduleType = Module.meta.type;

        const renderContext = {
          Module,
          canvas,
          context,
          video: modV.videoStream,
          features,
          meyda: modV.meyda,
          delta: δ,
          pipeline,
        };

        if (availableRenderers.indexOf(moduleType) > -1) {
          renderRenderer({
            canvas,
            context,
            renderFunction: renderers[moduleType].render,
            renderContext,
            pipeline,
            layer: Layer,
          });
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
