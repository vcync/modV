export default {
  meta: {
    name: "Buffer",
    type: "2d",
    version: "1.0.0",
    author: "modV",
  },
  props: {
    bufferId: {
      label: "Buffer ID",
      type: "text",
      default: () => new Date().getTime().toString(),
    },
    enabled: {
      label: "Enabled",
      type: "bool",
      default: true,
    },
    captureMode: {
      label: "Capture Mode",
      type: "enum",
      default: "continuous",
      enum: [
        { label: "Continuous", value: "continuous" },
        { label: "On Trigger", value: "trigger" },
        { label: "Once", value: "once" },
      ],
    },
    trigger: {
      label: "Trigger Capture",
      type: "event",
    },
    bufferOpacity: {
      label: "Buffer Opacity",
      type: "float",
      default: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
    clearBuffer: {
      label: "Clear Buffer",
      type: "bool",
      default: false,
    },
  },
  data: {
    bufferOutputId: null,
    bufferContext: null,
    bufferCanvas: null,
    captured: false,
    lastTrigger: false,
  },
  async addActiveModule({ store, moduleId }) {
    // Create an auxillary output for the buffer
    const outputContext = await store.dispatch("outputs/getAuxillaryOutput", {
      name: `Buffer-${moduleId}`,
      group: "buffer-modules",
      reactToResize: true,
    });

    // Update the module data with the buffer output information
    store.commit("modules/UPDATE_ACTIVE_MODULE", {
      id: moduleId,
      key: "data",
      value: {
        bufferOutputId: outputContext.id,
        bufferContext: outputContext.context,
        bufferCanvas: outputContext.context.canvas,
        captured: false,
        lastTrigger: false,
      },
    });
  },
  async removeModule({ store, moduleId }) {
    // Get the module data to access the buffer output ID
    const activeModules = store.state.modules.active;
    const module = Object.values(activeModules).find((m) => m.$id === moduleId);

    if (module && module.data && module.data.bufferOutputId) {
      // Clean up the auxillary output when module is removed
      store.commit("outputs/REMOVE_AUXILLARY", module.data.bufferOutputId);
    }
  },
  update({ props, data, store }) {
    // Update the auxillary output name if bufferId has changed
    const bufferId = props.bufferId;
    if (data.bufferOutputId && store) {
      let newName;
      if (bufferId && bufferId.trim()) {
        // Use the user-provided bufferId
        newName = bufferId;
      } else {
        // Fall back to a default name if no bufferId is provided
        newName = "Buffer";
      }

      store.commit("outputs/UPDATE_AUXILLARY", {
        auxillaryId: data.bufferOutputId,
        data: { name: newName },
      });
    }

    return data;
  },
  draw({ canvas, context, props, data }) {
    const { enabled, captureMode, trigger, bufferOpacity, clearBuffer } = props;

    if (!enabled || !data.bufferContext) {
      return;
    }

    // Clear the buffer if requested
    if (clearBuffer) {
      data.bufferContext.clearRect(
        0,
        0,
        data.bufferCanvas.width,
        data.bufferCanvas.height,
      );
      data.captured = false;
    }

    // Handle different capture modes
    let shouldCapture = false;

    if (captureMode === "trigger") {
      if (trigger && !data.lastTrigger) {
        shouldCapture = true;
      }
      data.lastTrigger = trigger;
    } else if (captureMode === "once" && !data.captured) {
      shouldCapture = true;
    } else if (captureMode === "continuous") {
      shouldCapture = true;
    }

    // Capture the current group's canvas state to the buffer
    if (shouldCapture) {
      data.bufferContext.clearRect(
        0,
        0,
        data.bufferCanvas.width,
        data.bufferCanvas.height,
      );
      data.bufferContext.drawImage(
        canvas,
        0,
        0,
        data.bufferCanvas.width,
        data.bufferCanvas.height,
      );
      data.captured = true;
    }

    // Optionally draw the buffer back to the current canvas with opacity
    if (bufferOpacity > 0 && data.captured) {
      context.save();
      context.globalAlpha = bufferOpacity;
      context.drawImage(data.bufferCanvas, 0, 0, canvas.width, canvas.height);
      context.restore();
    }
  },
};
