/* eslint-env worker */

// import { modV } from '@/modv';

const moduleRenderFunctions = new Map();

const canvases = new Map();
const contexts = new Map();

onmessage = (evt) => {
  if (evt.data.action === 'storeRenderFunction') {
    const { moduleName, renderFunction } = evt.data;

    moduleRenderFunctions.set(moduleName, eval(renderFunction)); //eslint-disable-line
  } else if (evt.data.action === 'drawFrame') {
    let canvas = evt.data.offscreenLayerCanvas;
    const bufferCanvas = evt.data.offscreenBufferCanvas;
    // const bufferContext = bufferCanvas.getContext('2d');
    let context;

    const { /* δ, */ moduleType, pipeline, moduleName/* , features */ } = evt.data;

    if (!canvas) {
      canvas = canvases.get(moduleName);
    } else {
      canvases.set(moduleName, canvas);
    }

    if (moduleType === 'Module2D') {
      context = contexts.get(moduleName);
      if (!context) {
        context = canvas.getContext('2d');
        contexts.set(moduleName, context);
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

        // Module.render({
        //   canvas,
        //   context,
        //   video: modV.videoStream,
        //   features,
        //   meyda: modV.meyda,
        //   delta: δ,
        // });

        // bufferContext.clearRect(0, 0, canvas.width, canvas.height);
        // bufferContext.drawImage(
        //   Layer.canvas,
        //   0,
        //   0,
        //   canvas.width,
        //   canvas.height,
        // );
      } else {
        // Module.render({
        //   canvas,
        //   context,
        //   video: modV.videoStream,
        //   features,
        //   meyda: modV.meyda,
        //   delta: δ,
        // });
      }
    }

    if (moduleType === 'ModuleShader') {
      context = canvas.getContext('webgl');

      // // webgl.texture = gl.texImage2D(
      // //   gl.TEXTURE_2D,
      // //   0,
      // //   gl.RGBA,
      // //   gl.RGBA,
      // //   gl.UNSIGNED_BYTE,
      // //   canvas,
      // // );

      // // webgl.resize(canvas.width, canvas.height);

      // // webglRender({
      // //   Module,
      // //   canvas,
      // //   delta: δ,
      // // });

      // Module.draw({
      //   canvas,
      //   context,
      //   video: modV.videoStream,
      //   pixelRatio: window.devicePixelRatio,
      //   delta: δ,
      // });

      // context.save();
      // context.globalAlpha = Module.info.alpha || 1;
      // context.globalCompositeOperation = Module.info.compositeOperation || 'normal';

      // // // Copy Shader Canvas to Main Canvas
      // // if (pipeline) {
      // //   bufferContext.clearRect(
      // //     0,
      // //     0,
      // //     canvas.width,
      // //     canvas.height,
      // //   );

      // //   bufferContext.drawImage(
      // //     webgl.canvas,
      // //     0,
      // //     0,
      // //     canvas.width,
      // //     canvas.height,
      // //   );
      // // } else {
      // //   context.drawImage(
      // //     webgl.canvas,
      // //     0,
      // //     0,
      // //     canvas.width,
      // //     canvas.height,
      // //   );
      // // }

      context.restore();
    }

    if (moduleType === 'ModuleISF') {
      // context = canvas.getContext('webgl');

      // if (pipeline) {
      //   context.clearRect(0, 0, canvas.width, canvas.height);
      //   context.drawImage(
      //     bufferCanvas,
      //     0,
      //     0,
      //     canvas.width,
      //     canvas.height,
      //   );

      //   Module.render({
      //     canvas,
      //     context,
      //     video: modV.videoStream,
      //     features,
      //     meyda: modV.meyda,
      //     delta: δ,
      //     pipeline,
      //   });

      //   bufferContext.clearRect(0, 0, canvas.width, canvas.height);
      //   bufferContext.drawImage(
      //     Layer.canvas,
      //     0,
      //     0,
      //     canvas.width,
      //     canvas.height,
      //   );
      // } else {
      //   Module.render({
      //     canvas,
      //     context,
      //     video: modV.videoStream,
      //     features,
      //     meyda: modV.meyda,
      //     delta: δ,
      //     pipeline,
      //   });
      // }
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

    // Push frames back to the original HTMLCanvasElement
    context.commit();
  }
};
