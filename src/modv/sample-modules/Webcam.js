export default {
  meta: {
    type: '2d',
    name: 'Webcam',
    author: '2xAA',
    version: '1.0.0',
  },

  draw({ canvas, context, video }) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  },
};
