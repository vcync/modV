/* eslint-env worker */
import store from "./store";
import { applyWindow } from "meyda/src/utilities";

const meyda = { windowing: applyWindow };

const buffer = new OffscreenCanvas(300, 300);
const bufferContext = buffer.getContext("2d");
store.dispatch("outputs/addAuxillaryOutput", {
  name: "loop-buffer",
  context: bufferContext
});

function loop(delta, features) {
  const {
    modules: { active },
    groups,
    outputs: { main, debug, debugContext, auxillary, webcam: video },
    renderers,
    windows
  } = store.state;

  if (!main) {
    return;
  }

  const preProcessFrameFunctions =
    store.getters["plugins/preProcessFrame"] || [];
  const preProcessFrameFunctionsLength = preProcessFrameFunctions.length;

  for (let i = 0; i < preProcessFrameFunctionsLength; ++i) {
    preProcessFrameFunctions[i].preProcessFrame({ features, store });
  }

  const renderersWithTick = store.getters["renderers/renderersWithTick"];
  const renderersWithTickLength = renderersWithTick.length;
  for (let i = 0; i < renderersWithTickLength; ++i) {
    renderersWithTick[i].tick();
  }

  const groupsLength = groups.length;
  for (let i = 0; i < groupsLength; ++i) {
    const group = groups[i];
    const groupModulesLength = group.modules.length;
    if (!group.enabled || groupModulesLength < 1 || group.alpha < 0.001) {
      continue;
    }

    const aux = group.drawToCanvasId && auxillary[group.drawToCanvasId].context;
    let drawTo = group.context.context;

    if (aux) {
      drawTo = aux;
    }

    if (group.clearing) {
      drawTo.clearRect(0, 0, drawTo.canvas.width, drawTo.canvas.height);
    }

    if (group.inherit) {
      let lastCanvas;

      if (i - 1 > -1) {
        lastCanvas = groups[i - 1].context.context.canvas;
      } else {
        lastCanvas = main.canvas;
      }

      drawTo.drawImage(
        lastCanvas,
        0,
        0,
        drawTo.canvas.width,
        drawTo.canvas.height
      );
    }

    for (let j = 0; j < groupModulesLength; ++j) {
      const module = active[group.modules[j]];

      if (!module.meta.enabled || module.meta.alpha < 0.001) {
        continue;
      }

      drawTo.save();
      drawTo.globalAlpha = module.meta.alpha || 1;
      drawTo.globalCompositeOperation =
        module.meta.compositeOperation || "normal";

      renderers[module.meta.type].render({
        canvas: drawTo.canvas,
        context: drawTo,
        delta,
        module,
        features,
        meyda,
        video
      });
      drawTo.restore();
    }
  }

  const windowKeys = Object.keys(windows);
  const windowsLength = windowKeys.length;

  main.clearRect(0, 0, main.canvas.width, main.canvas.height);
  for (let i = 0; i < groupsLength; ++i) {
    const group = groups[i];
    const {
      compositeOperation,
      context: { context },
      alpha,
      enabled,
      modules
    } = group;
    const groupModulesLength = modules.length;
    if (!enabled || groupModulesLength < 1 || !(alpha > 0)) {
      continue;
    }

    main.save();
    if (compositeOperation) {
      main.globalCompositeOperation = compositeOperation;
    }

    if (alpha < 1) {
      main.globalAlpha = alpha;
    }

    main.drawImage(context.canvas, 0, 0);
    main.restore();
  }

  for (let i = 0; i < windowsLength; ++i) {
    const { outputId } = windows[windowKeys[i]];
    const outputContext = store.state.outputs.auxillary[outputId];

    if (outputContext) {
      const { width, height } = outputContext.context.canvas;
      outputContext.context.clearRect(0, 0, width, height);
      outputContext.context.drawImage(main.canvas, 0, 0, width, height);
    }
  }

  if (main.canvas.width !== buffer.width) {
    buffer.width = main.canvas.width;
  }

  if (main.canvas.height !== buffer.height) {
    buffer.height = main.canvas.height;
  }

  if (debug && debugContext) {
    const { canvas: debugCanvas } = debugContext;
    const canvasToDebug = store.getters["outputs/canvasToDebug"];

    if (canvasToDebug) {
      debugCanvas.width = canvasToDebug.context.canvas.width;
      debugCanvas.height = canvasToDebug.context.canvas.height;

      debugContext.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
      debugContext.drawImage(canvasToDebug.context.canvas, 0, 0);
      debugContext.font = "32px monospace";
      debugContext.textBaseline = "hanging";
      debugContext.fillText(
        `${canvasToDebug.context.canvas.width} × ${
          canvasToDebug.context.canvas.height
        }`,
        10,
        10
      );
    }
  }

  // main.getImageData(0, 0, main.canvas.width, main.canvas.height);
}

export default loop;
