export default function resize(gl, canvas, width = 200, height = 200) {
  // Set canvas width
  canvas.width = width;
  canvas.height = height;

  // Set viewport size from gl context
  gl.viewport(0, 0, width, height);
}
