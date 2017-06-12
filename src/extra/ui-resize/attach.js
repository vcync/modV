import store from '@/../store/';
import top from './top';
import left from './left';

export default function attachResizeHandles() {
  const attachResizeTop = top();
  const attachResizeLeft = left();

  attachResizeTop(document.querySelector('resize-handle-top'), () => {
    store.dispatch('size/resizePreviewCanvas');
  });
  attachResizeLeft(document.querySelector('resize-handle-left'));
}