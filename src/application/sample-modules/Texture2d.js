export default {
  meta: {
    name: "Texture 2D",
    type: "2d",
    version: "1.0.0",
    author: "NERDDISCO"
  },
  props: {
    texture: {
      type: "texture"
    },
    scale: {
      label: "Scale",
      type: "float",
      default: 1,
      min: 0,
      max: 5,
      step: 0.001
    },
    offsetX: {
      label: "Offset X in %",
      type: "float",
      default: 0,
      min: -500,
      max: 500,
      step: 1
    },
    offsetY: {
      label: "Offset Y in %",
      type: "float",
      default: 0,
      min: -500,
      max: 500,
      step: 1
    }
  },
  draw({ canvas: { width, height }, context, props }) {
    const { scale, offsetX, offsetY } = props;

    if (props.texture.value) {
      const { width: imageWidth, height: imageHeight } = props.texture.value;
      const x = (width - imageWidth * scale) / 2;
      const y = (height - imageHeight * scale) / 2;
      const calculatedOffsetX = (width / 100) * offsetX;
      const calculatedOffsetY = (height / 100) * offsetY;

      context.drawImage(
        props.texture.value,
        x + calculatedOffsetX,
        y + calculatedOffsetY,
        imageWidth * scale,
        imageHeight * scale
      );
    }
  }
};
