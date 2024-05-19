import store from "../worker/store";

import {
  Renderer as ISFRenderer,
  Parser as ISFParser,
  Upgrader as ISFUpgrader,
} from "interactive-shader-format/src/main.js";
import { getFeatures } from "../worker/audio-features";
import constants from "../constants";

const isfCanvas = new OffscreenCanvas(300, 300);
const isfContext = isfCanvas.getContext("webgl2", {
  antialias: true,
  desynchronized: true,
  powerPreference: "high-performance",
  premultipliedAlpha: false,
});
store.dispatch("outputs/addAuxillaryOutput", {
  name: "isf-buffer",
  context: isfContext,
  group: "buffer",
});

const renderers = {};
const inputs = {};

function resize({ width, height }) {
  isfCanvas.width = width;
  isfCanvas.height = height;
}

function render({ module, canvas, context, pipeline, props }) {
  const renderer = renderers[module.meta.name];
  const moduleInputs = inputs[module.meta.name];

  // Only update the audio data if the module has audio inputs to improve performance
  // for modules that don't use any audio inputs at all
  if (renderer.hasAudio) {
    const features = getFeatures();
    const byteFrequencyData = features.byteFrequencyData;
    const byteTimeDomainData = features.byteTimeDomainData;

    renderer.audio.setFrequencyValues(byteFrequencyData, byteFrequencyData);
    renderer.audio.setTimeDomainValues(byteTimeDomainData, byteTimeDomainData);
  }

  if (moduleInputs) {
    for (let i = 0, len = moduleInputs.length; i < len; i++) {
      const input = moduleInputs[i];

      if (input.TYPE === "image") {
        if (input.NAME in props) {
          const resolvedTexture =
            (props[input.NAME] && props[input.NAME].value) || canvas;
          renderer.setValue(input.NAME, resolvedTexture);
        } else {
          renderer.setValue(input.NAME, canvas);
        }
      } else if (input.TYPE === "event") {
        renderer.setValue(input.NAME, !!props[input.NAME]);
      } else {
        renderer.setValue(input.NAME, props[input.NAME]);
      }
    }
  }

  if (isfCanvas.width !== canvas.width || isfCanvas.height !== canvas.height) {
    // We don't use the resize function as it's very non-performant for
    // some reason...
    isfCanvas.width = canvas.width;
    isfCanvas.height = canvas.height;
  }

  isfContext.clear(isfContext.COLOR_BUFFER_BIT);
  renderer.draw(isfCanvas);

  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(isfCanvas, 0, 0, canvas.width, canvas.height);
}

/**
 * Called each frame to update the Module
 */
function updateModule({ module, props, data, canvas, context, delta }) {
  const { data: dataUpdated } = module.update({
    props,
    data,
    canvas,
    context,
    delta,
  });

  return dataUpdated ?? data;
}

function resizeModule({ moduleDefinition, canvas, data, props }) {
  return moduleDefinition.resize({ canvas, data, props });
}

async function setupModule(moduleDefinition) {
  let fragmentShader = moduleDefinition.fragmentShader;
  let vertexShader = moduleDefinition.vertexShader;

  const parser = new ISFParser();
  parser.parse(fragmentShader, vertexShader);
  if (parser.error) {
    throw new Error(`Parsing error: ${parser.error}`);
  }

  if (parser.isfVersion < 2) {
    fragmentShader = ISFUpgrader.convertFragment(fragmentShader);
    if (vertexShader) {
      vertexShader = ISFUpgrader.convertVertex(vertexShader);
    }
  }

  moduleDefinition.meta.isfVersion = parser.isfVersion;
  moduleDefinition.meta.author = parser.metadata.CREDIT;
  moduleDefinition.meta.description = parser.metadata.DESCRIPTION;
  moduleDefinition.meta.version = parser.metadata.VSN;

  const renderer = new ISFRenderer(isfContext, {
    useWebAudio: false,
    fftSize: constants.AUDIO_BUFFER_SIZE,
    hasAudio: parser.hasAudio,
  });
  renderer.loadSource(fragmentShader, vertexShader);

  if (!renderer.valid) {
    throw renderer.errorWithCorrectedLines;
  }

  function addProp(name, prop) {
    if (!moduleDefinition.props) {
      moduleDefinition.props = {};
    }

    moduleDefinition.props[name] = prop;
  }

  const moduleInputs = parser.inputs;
  for (let i = 0, len = moduleInputs.length; i < len; i++) {
    const input = moduleInputs[i];

    switch (input.TYPE) {
      default:
        break;

      case "float":
        addProp(input.NAME, {
          type: "float",
          label: input.LABEL || input.NAME,
          default: typeof input.DEFAULT !== "undefined" ? input.DEFAULT : 0.0,
          min: input.MIN,
          max: input.MAX,
          step: 0.01,
        });
        break;

      case "bool":
        addProp(input.NAME, {
          type: "bool",
          label: input.LABEL || input.NAME,
          default: Boolean(input.DEFAULT),
        });
        break;

      case "long":
        addProp(input.NAME, {
          type: "enum",
          label: input.NAME,
          enum: input.VALUES.map((value, idx) => ({
            label: input.LABELS[idx],
            value,
            selected: value === input.DEFAULT,
          })),
        });
        break;

      case "color":
        addProp(input.NAME, {
          type: "vec4",
          label: input.LABEL || input.NAME,
          default: input.DEFAULT,
        });
        break;

      case "point2D":
        addProp(input.NAME, {
          type: "vec2",
          label: input.LABEL || input.NAME,
          default: input.DEFAULT || [0.0, 0.0],
          min: input.MIN,
          max: input.MAX,
        });
        break;

      case "image":
        moduleDefinition.meta.previewWithOutput = true;

        addProp(input.NAME, {
          type: "texture",
          label: input.LABEL || input.NAME,
        });

        break;

      case "event":
        addProp(input.NAME, {
          type: "event",
          label: input.LABEL || input.NAME,
        });
        break;
    }
  }

  renderers[moduleDefinition.meta.name] = renderer;
  inputs[moduleDefinition.meta.name] = moduleInputs;
  moduleDefinition.draw = render;

  return moduleDefinition;
}

export default {
  setupModule,
  render,
  updateModule,
  resizeModule,
  resize,
};
