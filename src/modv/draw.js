import { Module2D, ModuleShader, modV } from '@/modv';
import webglRender from '@/modv/webgl/render';
import store from '@/../store';
import mux from './mux';

function draw(δ) {
  const layers = store.getters['layers/allLayers'];
  const audioFeatures = store.getters['meyda/features'];
  const getActiveModule = store.getters['modVModules/getActiveModule'];

  const webgl = modV.webgl;
  const gl = webgl.gl;

  if(!modV.meyda) return;
  const features = modV.meyda.get(audioFeatures);

  layers.forEach((Layer) => {
    const canvas = Layer.canvas;
    const context = Layer.context;

    context.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(Layer.modules).forEach((moduleName) => {
      const Module = getActiveModule(moduleName);

      if(!Module.info.enabled || Module.info.alpha === 0) return;

      if(Module instanceof Module2D) {
        Module.render({
          canvas,
          context,
          video: modV.videoStream,
          features,
          meyda: modV.meyda,
          delta: δ
        });
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
        context.drawImage(
          webgl.canvas,
          0,
          0,
          canvas.width,
          canvas.height
        );
        context.restore();
      }
    });
  });

  mux();
}

export default draw;