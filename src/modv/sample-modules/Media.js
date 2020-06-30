export default {
  meta: {
    name: "Media",
    type: "2d"
  },

  props: {
    media: {
      type: "texture",
      label: "Media"
    }
  },

  draw({ canvas, context }) {
    const { width, height } = canvas;
    if (this.media) context.drawImage(this.media.texture, 0, 0, width, height);
  }
};
