import store from "../worker/store";

import { interactiveShaderFormat } from "interactive-shader-format/dist/build-worker";

const {
  Renderer: ISFRenderer,
  Parser: ISFParser,
  Upgrader: ISFUpgrader
} = interactiveShaderFormat;

const isfCanvas = new OffscreenCanvas(300, 300);
const isfContext = isfCanvas.getContext("webgl2");
store.dispatch("outputs/addAuxillaryOutput", {
  name: "isf-buffer",
  context: isfContext
});

function render({ module, canvas, context, pipeline }) {
  if (module.inputs) {
    const inputs = module.inputs;
    for (let i = 0, len = inputs.length; i < len; i++) {
      const input = inputs[i];

      if (input.TYPE === "image") {
        if (input.NAME in module.props) {
          const resolvedTexture =
            (module[input.NAME] && module[input.NAME].texture) || canvas;
          module.renderer.setValue(input.NAME, resolvedTexture);
        } else {
          module.renderer.setValue(input.NAME, canvas);
        }
      } else {
        module.renderer.setValue(input.NAME, module[input.NAME]);
      }
    }
  }

  // isfContext.clear(isfContext.COLOR_BUFFER_BIT);
  if (isfCanvas.width < canvas.width || isfCanvas.height < canvas.height) {
    isfCanvas.width = canvas.width;
    isfCanvas.height = canvas.height;
  }

  module.renderer.draw(isfCanvas);

  context.save();
  context.globalAlpha = module.meta.alpha || 1;
  context.globalCompositeOperation = module.meta.compositeOperation || "normal";
  if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(isfCanvas, 0, 0, canvas.width, canvas.height);
  context.restore();
}

async function setupModule(module) {
  let fragmentShader = module.fragmentShader;
  let vertexShader = module.vertexShader;

  const parser = new ISFParser();
  parser.parse(fragmentShader, vertexShader);
  if (parser.error) {
    throw new Error(
      `Error evaluating ${module.meta.name}'s shaders: ${parser.error}`
    );
  }

  if (parser.isfVersion < 2) {
    fragmentShader = ISFUpgrader.convertFragment(fragmentShader);
    if (vertexShader) vertexShader = ISFUpgrader.convertVertex(vertexShader);
  }

  module.meta.isfVersion = parser.isfVersion;
  module.meta.author = parser.metadata.CREDIT;
  module.meta.description = parser.metadata.DESCRIPTION;
  module.meta.version = parser.metadata.VSN;

  module.renderer = new ISFRenderer(isfContext);
  module.renderer.loadSource(fragmentShader, vertexShader);

  function addProp(name, prop) {
    if (!module.props) {
      module.props = {};
    }

    module.props[name] = prop;
  }

  module.inputs = parser.inputs;

  const inputs = parser.inputs;
  for (let i = 0, len = inputs.length; i < len; i++) {
    const input = inputs[i];

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
          control: {
            type: "colorControl",
            options: {
              returnFormat: "mappedRgbaArray"
            }
          },
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

  module.draw = render;

  return module;
}

export default {
  setupModule,
  render
};
