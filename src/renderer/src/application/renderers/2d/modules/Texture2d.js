export default {
  meta: {
    name: "Texture 2D",
    type: "2d",
    version: "1.0.0",
    author: "NERDDISCO",
  },
  props: {
    texture: {
      type: "texture",
    },
    cropTop: {
      label: "Crop Top (px)",
      type: "int",
      default: 0,
      min: 0,
      max: 4096,
      step: 1,
    },
    cropRight: {
      label: "Crop Right (px)",
      type: "int",
      default: 0,
      min: 0,
      max: 4096,
      step: 1,
    },
    cropBottom: {
      label: "Crop Bottom (px)",
      type: "int",
      default: 0,
      min: 0,
      max: 4096,
      step: 1,
    },
    cropLeft: {
      label: "Crop Left (px)",
      type: "int",
      default: 0,
      min: 0,
      max: 4096,
      step: 1,
    },
    scale: {
      label: "Scale",
      type: "float",
      default: 1,
      min: 0,
      max: 5,
      step: 0.001,
    },
    offsetX: {
      label: "Offset X in %",
      type: "float",
      default: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    offsetY: {
      label: "Offset Y in %",
      type: "float",
      default: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    constrain: {
      label: "Constrain",
      type: "enum",
      default: "none",
      enum: [
        { label: "None (Scale)", value: "none" },
        { label: "Contain", value: "contain" },
        { label: "Cover", value: "cover" },
      ],
    },
  },
  draw({ canvas: { width, height }, context, props }) {
    const {
      constrain,
      offsetX,
      offsetY,
      scale,
      texture,
      cropTop = 0,
      cropRight = 0,
      cropBottom = 0,
      cropLeft = 0,
    } = props;

    if (texture.value) {
      let { width: imageWidth, height: imageHeight } = texture.value;

      // Clamp crop to image bounds
      const clampedTop = Math.max(0, Math.min(cropTop, imageHeight - 1));
      const clampedBottom = Math.max(0, Math.min(cropBottom, imageHeight - 1));
      const clampedLeft = Math.max(0, Math.min(cropLeft, imageWidth - 1));
      const clampedRight = Math.max(0, Math.min(cropRight, imageWidth - 1));

      const sx = clampedLeft;
      const sy = clampedTop;
      const sWidth = Math.max(1, imageWidth - clampedLeft - clampedRight);
      const sHeight = Math.max(1, imageHeight - clampedTop - clampedBottom);

      let x;
      let y;

      // Determine destination size based on CROPPED source aspect ratio
      const srcAspect = sHeight / sWidth;
      if (constrain === "contain") {
        imageHeight = (sHeight / sWidth) * width;
        imageWidth = width;

        y = (height - imageHeight) / 2;
        x = 0;

        if (imageHeight > height) {
          imageWidth = (sWidth / sHeight) * height;
          imageHeight = height;

          y = 0;
          x = (width - imageWidth) / 2;
        }
      } else if (constrain === "cover") {
        const canvasRatio = height / width;

        if (srcAspect < canvasRatio) {
          // Make height fill canvas
          imageHeight = height;
          imageWidth = height / srcAspect;
          x = (width - imageWidth) / 2;
          y = 0;
        } else {
          // Make width fill canvas
          imageWidth = width;
          imageHeight = width * srcAspect;
          x = 0;
          y = (height - imageHeight) / 2;
        }
      } else {
        imageWidth = sWidth * scale;
        imageHeight = sHeight * scale;

        x = (width - imageWidth) / 2;
        y = (height - imageHeight) / 2;
      }

      const calculatedOffsetX = (width / 100) * offsetX;
      const calculatedOffsetY = (height / 100) * offsetY;

      // Draw cropped region of the source texture scaled to the destination rect
      context.drawImage(
        texture.value,
        sx,
        sy,
        sWidth,
        sHeight,
        x + calculatedOffsetX,
        y + calculatedOffsetY,
        imageWidth,
        imageHeight,
      );
    }
  },
};
