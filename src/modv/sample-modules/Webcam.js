export default {
  meta: {
    type: '2d',
    name: 'Webcam',
    author: '2xAA',
    version: '1.0.0'
  },

  props: {
    scale: {
      type: 'float',
      min: 1,
      max: 10,
      default: 1
    },

    position: {
      type: 'vec2',
      default: [0.5, 0.5],
      min: 0,
      max: 1
    }
  },

  draw({ canvas, context, video }) {
    const { position, scale } = this
    const { videoWidth, videoHeight } = video
    const { width, height } = canvas

    context.drawImage(
      video,
      width * position[0] - (videoWidth * scale) / 2,
      height * (1 - position[1]) - (videoHeight * scale) / 2,
      videoWidth * scale,
      videoHeight * scale
    )
  }
}
