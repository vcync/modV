import { modV } from '@/modv';
import CCapture from 'ccapture.js';
import store from '@/store';

const capturer = new CCapture({
  verbose: true,
  framerate: 60,
  // motionBlurFrames: 16,
  quality: 10,
  format: 'webm',
});

window.capturer = capturer;

/**
 * Combine all given layers onto a "multiplex" (mux) Canvas
 *
 * @param {Array#Layer} layers Layers to multiplex
 *
 * @returns {Layer}
 */
function mux(layers) {
  return new Promise((resolve) => {
    const windows = store.getters['windows/allWindows'];
    const width = modV.width;
    const height = modV.height;

    const outputCanvas = modV.outputCanvas;
    const outputContext = modV.outputContext;

    outputContext.clearRect(0, 0, width, height);

    const layersWithWindowIds = layers.filter(layer => layer.drawToWindowId !== null);
    const layerWindowIds = layersWithWindowIds.map(layer => layer.drawToWindowId);

    const windowIdLookup = layersWithWindowIds.reduce((o, layer) => ({
      ...o,
      [layer.drawToWindowId]: windows
        .findIndex(windowController => windowController.id === layer.drawToWindowId),
    }), {});

    layers.forEach((layer) => {
      if (!layer.enabled || layer.alpha === 0) return;
      const canvas = layer.canvas;

      if (layer.drawToOutput) {
        outputContext.drawImage(canvas, 0, 0, width, height);
      }

      if (layer.drawToWindowId) {
        const { context } = windows[windowIdLookup[layer.drawToWindowId]];

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      }
    });

    resolve();

    store.getters['plugins/enabledPlugins'].filter(plugin => ('processFrame' in plugin.plugin))
      .forEach(plugin => plugin.plugin.processFrame({
        canvas: outputCanvas,
        context: outputContext,
      }),
      );

    capturer.capture(outputCanvas);

    windows.filter(windowController => layerWindowIds.indexOf(windowController.id) < 0)
      .forEach((windowController) => {
        const { canvas, context } = windowController;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);
      });
  });
}

export default mux;
