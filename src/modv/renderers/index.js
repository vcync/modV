import twoD from './2d';
import * as isf from './isf';
import * as shader from './shader';

const twoDRenderer = {
  name: '2d',
  render: twoD,
};

const isfRenderer = {
  name: 'isf',
  render: isf.render,
  setup: isf.setup,
};

const shaderRenderer = {
  name: 'shader',
  render: shader.render,
  setup: shader.setup,
};

export {
  twoDRenderer,
  isfRenderer,
  shaderRenderer,
};
