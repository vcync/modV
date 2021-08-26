import store from "../worker/store";

import { interactiveShaderFormat } from "interactive-shader-format/dist/build-worker";

const {
  Renderer: ISFRenderer,
  Parser: ISFParser,
  Upgrader: ISFUpgrader
} = interactiveShaderFormat;

const isfCanvas = new OffscreenCanvas(300, 300);
const isfContext = isfCanvas.getContext("webgl2", {
  antialias: true,
  desynchronized: true,
  powerPreference: "high-performance",
  premultipliedAlpha: false
});
store.dispatch("outputs/addAuxillaryOutput", {
  name: "isf-buffer",
  context: isfContext,
  group: "buffer"
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

  isfCanvas.width = canvas.width;
  isfCanvas.height = canvas.height;

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
      } else {
        renderer.setValue(input.NAME, props[input.NAME]);
      }
    }
  }

  isfContext.clear(isfContext.COLOR_BUFFER_BIT);
  renderer.draw(isfCanvas);

  if (pipeline) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(isfCanvas, 0, 0, canvas.width, canvas.height);
}

async function setupModule(module) {
  let fragmentShader = module.fragmentShader;
  let vertexShader = module.vertexShader;

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

  module.meta.isfVersion = parser.isfVersion;
  module.meta.author = parser.metadata.CREDIT;
  module.meta.description = parser.metadata.DESCRIPTION;
  module.meta.version = parser.metadata.VSN;

  const renderer = new ISFRenderer(isfContext);
  renderer.loadSource(fragmentShader, vertexShader);

  if (!renderer.valid) {
    throw renderer.errorWithCorrectedLines;
  }

  function addProp(name, prop) {
    if (!module.props) {
      module.props = {};
    }

    module.props[name] = prop;
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
          step: 0.01
        });
        break;

      case "bool":
        addProp(input.NAME, {
          type: "bool",
          label: input.LABEL || input.NAME,
          default: Boolean(input.DEFAULT)
        });
        break;

      case "long":
        addProp(input.NAME, {
          type: "enum",
          label: input.NAME,
          enum: input.VALUES.map((value, idx) => ({
            label: input.LABELS[idx],
            value,
            selected: value === input.DEFAULT
          }))
        });
        break;

      case "color":
        addProp(input.NAME, {
          type: "vec4",
          label: input.LABEL || input.NAME,
          default: input.DEFAULT
        });
        break;

      case "point2D":
        addProp(input.NAME, {
          type: "vec2",
          label: input.LABEL || input.NAME,
          default: input.DEFAULT || [0.0, 0.0],
          min: input.MIN,
          max: input.MAX
        });
        break;

      case "image":
        module.meta.previewWithOutput = true;

        addProp(input.NAME, {
          type: "texture",
          label: input.LABEL || input.NAME
        });

        break;
    }
  }

  renderers[module.meta.name] = renderer;
  inputs[module.meta.name] = moduleInputs;
  module.draw = render;

  return module;
}

export default {
  setupModule,
  render,
  resize
};
