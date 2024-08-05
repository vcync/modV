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
    const { constrain, offsetX, offsetY, scale, texture } = props;

    if (texture.value) {
      let { width: imageWidth, height: imageHeight } = texture.value;

      let x;
      let y;

      if (constrain === "contain") {
        imageHeight = (imageHeight / imageWidth) * width;
        imageWidth = width;

        y = (height - imageHeight) / 2;
        x = 0;

        if (imageHeight > height) {
          imageWidth = (imageWidth / imageHeight) * height;
          imageHeight = height;

          y = 0;
          x = (width - imageWidth) / 2;
        }
      } else if (constrain === "cover") {
        const imageRatio = imageHeight / imageWidth;
        const canvasRatio = height / width;

        if (imageRatio < canvasRatio) {
          imageWidth = (width * canvasRatio) / imageRatio;
          imageHeight = height;

          x = (width - imageWidth) / 2;
          y = 0;
        } else {
          imageHeight = width * imageRatio;
          imageWidth = width;

          x = 0;
          y = (height - imageHeight * scale) / 2;
        }
      } else {
        imageWidth = imageWidth * scale;
        imageHeight = imageHeight * scale;

        x = (width - imageWidth) / 2;
        y = (height - imageHeight) / 2;
      }

      const calculatedOffsetX = (width / 100) * offsetX;
      const calculatedOffsetY = (height / 100) * offsetY;

      context.drawImage(
        texture.value,
        x + calculatedOffsetX,
        y + calculatedOffsetY,
        imageWidth,
        imageHeight,
      );
    }
  },
};
