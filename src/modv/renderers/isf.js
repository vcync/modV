import { isf } from "@/modv";
import {
  Renderer as ISFRenderer,
  Parser as ISFParser,
  Upgrader as ISFUpgrader
} from "interactive-shader-format-for-modv";

function render({ Module, canvas, context, pipeline }) {
  if (Module.inputs) {
    Module.inputs.forEach(input => {
      if (input.TYPE === "image") {
        if (input.NAME in Module.props) {
          Module.renderer.setValue(
            input.NAME,
            (Module[input.NAME] && Module[input.NAME].texture) || canvas
          );
        } else {
          Module.renderer.setValue(input.NAME, canvas);
        }
      } else {
        Module.renderer.setValue(input.NAME, Module[input.NAME]);
      }
    });
  }

  isf.gl.clear(isf.gl.COLOR_BUFFER_BIT);
  Module.renderer.draw(isf.canvas);

  context.save();
  context.globalAlpha = Module.meta.alpha || 1;
  context.globalCompositeOperation = Module.meta.compositeOperation || "normal";
  if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(isf.canvas, 0, 0, canvas.width, canvas.height);
  context.restore();
}

function setup(Module) {
  return new Promise(resolve => {
    let fragmentShader = Module.fragmentShader;
    let vertexShader = Module.vertexShader;

    const parser = new ISFParser();
    parser.parse(fragmentShader, vertexShader);
    if (parser.error) {
      throw new Error(
        parser.error,
        `Error evaluating ${Module.meta.name}'s shaders`
      );
    }

    if (parser.isfVersion < 2) {
      fragmentShader = ISFUpgrader.convertFragment(fragmentShader);
      if (vertexShader) vertexShader = ISFUpgrader.convertVertex(vertexShader);
    }

    Module.meta.isfVersion = parser.isfVersion;
    Module.meta.author = parser.metadata.CREDIT;
    Module.meta.description = parser.metadata.DESCRIPTION;
    Module.meta.version = parser.metadata.VSN;

    Module.renderer = new ISFRenderer(isf.gl);
    Module.renderer.loadSource(fragmentShader, vertexShader);

    function addProp(name, prop) {
      if (!Module.props) {
        Module.props = {};
      }

      Module.props[name] = prop;
    }

    Module.inputs = parser.inputs;

    parser.inputs.forEach(input => {
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
          Module.meta.previewWithOutput = true;

          addProp(input.NAME, {
            type: "texture",
            label: input.LABEL || input.NAME
          });

          break;
      }
    });

    Module.draw = render;

    resolve(Module);
  });
}

export {
  setup, //eslint-disable-line
  render
};
