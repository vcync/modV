import twoD from "./2d";
import * as isf from "./isf";
import * as shader from "./shader";
import * as threeD from "./3d";

const twoDRenderer = {
  name: "2d",
  render: twoD
};

const isfRenderer = {
  name: "isf",
  render: isf.render,
  setup: isf.setup
};

const shaderRenderer = {
  name: "shader",
  render: shader.render,
  setup: shader.setup
};

const threeDRenderer = {
  name: "3d",
  render: threeD.render,
  setup: threeD.setup,
  initVars: threeD.initVars
};

export { twoDRenderer, isfRenderer, shaderRenderer, threeDRenderer };
