<template>
  <div class='canvas-preview' ref='preview'>
    <output-window-button></output-window-button>
    <canvas id='preview-canvas'></canvas>
  </div>
</template>

<script>
  import OutputWindowButton from '@/components/OutputWindowButton';
  import interact from 'interactjs';

  function dragMoveListener(event) {
    const target = event.target;
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    const maxX = window.innerWidth - (10 + target.offsetWidth);
    const maxY = window.innerHeight - (10 + target.offsetHeight);
    const minX = 10;
    const minY = 10;

    if (x >= maxX) x = maxX;
    if (y >= maxY) y = maxY;
    if (x <= minX) x = minX;
    if (y <= minY) y = minY;

    // translate the element
    target.style.transform = `translate(${x}px, ${y}px)`;

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  export default {
    name: 'canvas-preview',
    components: {
      OutputWindowButton,
    },
    mounted() {
      const preview = this.$refs.preview;
      const initialWidth = preview.offsetWidth;
      const initialHeight = preview.offsetHeight;

      interact(preview)
        .draggable({
          onmove: dragMoveListener,
        })
        .resizable({
          preserveAspectRatio: true,
          edges: { left: true, right: true, bottom: true, top: true },
        })
        .on('resizemove', (event) => {
          const target = event.target;
          let x = (parseFloat(target.getAttribute('data-x')) || 0);
          let y = (parseFloat(target.getAttribute('data-y')) || 0);

          let eventWidth = event.rect.width;
          let eventHeight = event.rect.height;

          const maxWidth = initialWidth * 4;
          const maxHeight = initialHeight * 4;

          if (eventWidth >= maxWidth) eventWidth = maxWidth;
          if (eventHeight >= maxHeight) eventHeight = maxHeight;
          if (eventWidth <= initialWidth) eventWidth = initialWidth;
          if (eventHeight <= initialHeight) eventHeight = initialHeight;

          // update the element's style
          target.style.width = `${eventWidth}px`;
          target.style.height = `${eventHeight}px`;

          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          const maxX = window.innerWidth - (10 + target.offsetWidth);
          const maxY = window.innerHeight - (10 + target.offsetHeight);
          const minX = 10;
          const minY = 10;

          if (x >= maxX) x = maxX;
          if (y >= maxY) y = maxY;
          if (x <= minX) x = minX;
          if (y <= minY) y = minY;

          target.style.transform = `translate(${x}px, ${y}px)`;

          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        });

      const x = window.innerWidth - (10 + preview.offsetWidth);
      const y = window.innerHeight - (10 + preview.offsetHeight);
      preview.style.transform = `translate(${x}px, ${y}px)`;
      preview.setAttribute('data-x', x);
      preview.setAttribute('data-y', y);
    },
  };
</script>

<style lang='scss'>
  .canvas-preview {
    position: absolute;
    padding: 0;
    margin: 0;
    font-size: 0;
    overflow: auto;
    border-radius: 4px;
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.24);
  }
</style>
