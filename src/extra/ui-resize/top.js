export default function top(resizeTargetIn) {
  let resizeTarget = resizeTargetIn;
  return function attachResizeTop(handle, cb) {
    let allowDrag = false;
    const topNode = document.querySelector('.top');
    const bottomNode = document.querySelector('.bottom');

    window.addEventListener('mousedown', (e) => {
      if(e.which > 1) return;
      allowDrag = true;
      resizeTarget = e.target;
    });

    window.addEventListener('mouseup', () => {
      allowDrag = false;
      resizeTarget = null;

      if(cb) cb();
    });

    window.addEventListener('mousemove', (e) => {
      if(!allowDrag) return;
      if(resizeTarget !== handle) return;

      const percentageHeight = (e.clientY / window.innerHeight) * 100;

      bottomNode.style.height = `${(100 - percentageHeight)}%`;
      topNode.style.height = `${percentageHeight}%`;

      if(cb) cb();
    });
  };
}