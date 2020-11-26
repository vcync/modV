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
    positionX: {
      label: "Position X",
      type: "float",
      default: 0,
      min: -2000,
      max: 2000,
      step: 1
    },
    positionY: {
      label: "Position Y",
      type: "float",
      default: 0,
      min: -2000,
      max: 2000,
      step: 1
    }
  },
  draw({ canvas: { width, height }, context, props }) {
    const { scale, positionX, positionY } = props;

    if (props.texture.value) {
      const { width: imageWidth, height: imageHeight } = props.texture.value;
      const x = (width - imageWidth * scale) / 2;
      const y = (height - imageHeight * scale) / 2;

      context.drawImage(
        props.texture.value,
        x + positionX,
        y + positionY,
        imageWidth * scale,
        imageHeight * scale
      );
    }
  }
};
