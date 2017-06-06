export default function resize(gl, canvas, width = 200, height = 200, dpr = 1) {
  // Set canvas width
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set viewport size from gl context
  gl.viewport(0, 0, width, height);
}