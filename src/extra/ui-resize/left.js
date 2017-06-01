export default function left(resizeTargetIn) {
  let resizeTarget = resizeTargetIn;
  return function attachResizeLeft(handle) {
    let allowDrag = false;
    const layersNode = document.querySelector('.active-list-wrapper');
    const galleryOuterNode = document.querySelector('.gallery-wrapper');

    window.addEventListener('mousedown', (e) => {
      if(e.which > 1) return;
      allowDrag = true;
      resizeTarget = e.target;
    });

    window.addEventListener('mouseup', () => {
      allowDrag = false;
      resizeTarget = null;
    });

    window.addEventListener('mousemove', (e) => {
      if(!allowDrag) return;
      if(resizeTarget !== handle) return;

      const percentageWidth = (e.clientX / window.innerWidth) * 100;

      galleryOuterNode.style.width = `${(100 - percentageWidth)}%`;
      layersNode.style.width = `${percentageWidth}%`;
    });
  };
}