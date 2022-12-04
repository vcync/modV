export default {
  meta: {
    name: "Video",
    type: "2d",
    version: "1.0.0",
    author: "vcync"
  },
  props: {
    video: {
      type: "video"
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
      min: -100,
      max: 100,
      step: 1
    },
    offsetY: {
      label: "Offset Y in %",
      type: "float",
      default: 0,
      min: -100,
      max: 100,
      step: 1
    }
  },
  draw({ canvas: { width, height }, context, props }) {
    const { scale, offsetX, offsetY } = props;

    if (props.video.value) {
      const { width: imageWidth, height: imageHeight } = props.video.value;
      const x = (width - imageWidth * scale) / 2;
      const y = (height - imageHeight * scale) / 2;
      const calculatedOffsetX = (width / 100) * offsetX;
      const calculatedOffsetY = (height / 100) * offsetY;

      context.drawImage(
        props.video.value,
        x + calculatedOffsetX,
        y + calculatedOffsetY,
        imageWidth * scale,
        imageHeight * scale
      );
    }
  }
};
