import { modV } from '@/modv';
import store from '@/../store';

function mux() {
  const layers = store.getters['layers/allLayers'];
  const windows = store.getters['windows/allWindows'];
  const width = modV.width;
  const height = modV.height;

  const outputCanvas = modV.outputCanvas;
  const outputContext = modV.outputContext;

  outputContext.clearRect(0, 0, width, height);

  layers.forEach((Layer) => {
    if(!Layer.enabled || Layer.alpha === 0 || !Layer.drawToOutput) return;
    const canvas = Layer.canvas;
    outputContext.drawImage(canvas, 0, 0, width, height);
  });

  windows.forEach((windowController) => {
    const canvas = windowController.canvas;
    const context = windowController.context;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);
  });
}

export default mux;