/**
 * Shared utility functions for all renderers
 */

/**
 * Efficiently resize a canvas only when dimensions actually change
 * @param {OffscreenCanvas} canvas - The canvas to resize
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {boolean} - True if resize was performed, false if dimensions were already correct
 */
export function resizeCanvas(canvas, width, height) {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

/**
 * Efficiently resize multiple canvases to the same dimensions
 * @param {Array<OffscreenCanvas>} canvases - Array of canvases to resize
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {boolean} - True if any canvas was resized
 */
export function resizeCanvases(canvases, width, height) {
  let resized = false;
  for (const canvas of canvases) {
    if (resizeCanvas(canvas, width, height)) {
      resized = true;
    }
  }
  return resized;
}

/**
 * Clear a canvas context with optimized clearing
 * @param {CanvasRenderingContext2D|WebGL2RenderingContext} context - The context to clear
 * @param {number} [width] - Canvas width
 * @param {number} [height] - Canvas height
 */
export function clearCanvas(context, width, height) {
  if (context.clearRect) {
    // 2D context
    context.clearRect(
      0,
      0,
      width ?? context.canvas.width,
      height ?? context.canvas.height,
    );
  } else if (context.clear) {
    // WebGL context
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
  }
}

/**
 * Copy one canvas to another with size validation
 * @param {CanvasRenderingContext2D} destContext - Destination context
 * @param {HTMLCanvasElement|OffscreenCanvas} sourceCanvas - Source canvas
 * @param {number} [destWidth] - Destination width
 * @param {number} [destHeight] - Destination height
 */
export function copyCanvas(destContext, sourceCanvas, destWidth, destHeight) {
  if (sourceCanvas.width > 0 && sourceCanvas.height > 0) {
    destContext.drawImage(
      sourceCanvas,
      0,
      0,
      destWidth ?? sourceCanvas.width,
      destHeight ?? sourceCanvas.height,
    );
  }
}
