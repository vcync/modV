import top from './top';
import left from './left';

export default function attachResizeHandles(/* modV */) {
  const attachResizeTop = top();
  const attachResizeLeft = left();

  attachResizeTop(document.querySelector('resize-handle-top'));
  attachResizeLeft(document.querySelector('resize-handle-left'));
}