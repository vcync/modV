export default {
  get GALLERY_GROUP_NAME() {
    return "modV internal Gallery Group";
  },

  get LAYOUT_STATE_KEY() {
    return "layoutState";
  },

  get LAYOUT_LOAD_ERROR() {
    return "layoutLoadError";
  },

  get AUDIO_BUFFER_SIZE() {
    return 512;
  },
};

export const GROUP_DISABLED = 0;
export const GROUP_ENABLED = 1;
export const GROUP_DRAW_TO_OUTPUT = 2;
