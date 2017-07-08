import { Module2D, ModuleShader, ModuleISF, modV } from '@/modv';
import webglRender from '@/modv/webgl/render';
import store from '@/../store';
import mux from './mux';

function draw(δ) {
  const layers = store.getters['layers/allLayers'];
  const audioFeatures = store.getters['meyda/features'];
  const getActiveModule = store.getters['modVModules/getActiveModule'];
  const previewValues = store.getters['size/previewValues'];

  const webgl = modV.webgl;
  const gl = webgl.gl;

  const bufferCanvas = modV.bufferCanvas;
  const bufferContext = modV.bufferContext;

  if(!modV.meyda) return;
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

    if(pipeline && clearing) {
      bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    }

    if(clearing) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    if(inherit) {
      let lastCanvas;

      if(inheritFrom < 0) {
        if(LayerIndex - 1 > -1) {
          lastCanvas = modV.layers[LayerIndex - 1].canvas;
        } else {
          lastCanvas = modV.outputCanvas;
        }
      } else {
        lastCanvas = modV.layers[inheritFrom].canvas;
      }

      context.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);

      if(pipeline) bufferContext.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);
    }

    if(!enabled || alpha === 0) return;

    Layer.moduleOrder.forEach((moduleName, moduleIndex) => {
      const Module = getActiveModule(moduleName);

      if(!Module.info.enabled || Module.info.alpha === 0) return;

      if(pipeline && moduleIndex !== 0) {
        canvas = bufferCanvas;
      } else if(pipeline) {
        canvas = Layer.canvas;
      }

      if(Module instanceof Module2D) {
        if(pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height
          );

          Module.render({
            canvas,
            context,
            video: modV.videoStream,
            features,
            meyda: modV.meyda,
            delta: δ
          });

          bufferContext.clearRect(0, 0, canvas.width, canvas.height);
          bufferContext.drawImage(
            Layer.canvas,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } else {
          Module.render({
            canvas,
            context,
            video: modV.videoStream,
            features,
            meyda: modV.meyda,
            delta: δ
          });
        }
      }

      if(Module instanceof ModuleShader) {
        webgl.texture = gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          canvas
        );

        webgl.resize(canvas.width, canvas.height);

        webglRender({
          Module,
          canvas,
          delta: δ
        });

        context.save();
        context.globalAlpha = Module.info.alpha || 1;
        context.globalCompositeOperation = Module.info.compositeOperation || 'normal';

        // Copy Shader Canvas to Main Canvas
        if(pipeline) {
          bufferContext.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          bufferContext.drawImage(
            webgl.canvas,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } else {
          context.drawImage(
            webgl.canvas,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }

        context.restore();
      }

      if(Module instanceof ModuleISF) {
        if(pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height
          );

          Module.render({
            canvas,
            context,
            video: modV.videoStream,
            features,
            meyda: modV.meyda,
            delta: δ
          });

          bufferContext.clearRect(0, 0, canvas.width, canvas.height);
          bufferContext.drawImage(
            Layer.canvas,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } else {
          Module.render({
            canvas,
            context,
            video: modV.videoStream,
            features,
            meyda: modV.meyda,
            delta: δ
          });
        }
      }

      if(pipeline) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          bufferCanvas,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    });
  });

  mux().then(() => {
    modV.previewContext.clearRect(0, 0, modV.previewCanvas.width, modV.previewCanvas.height);
    modV.previewContext.drawImage(
      modV.outputCanvas,
      previewValues.x,
      previewValues.y,
      previewValues.width,
      previewValues.height
    );
  });
}

export default draw;