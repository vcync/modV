export function createWebcodecVideo(id, modV) {
  return Promise(async (resolve, reject) => {
    const url = modV.store.state.videos[id];
    const video = document.createElement("video");
    video.setAttribute("crossorigin", "anonymous");
    video.setAttribute("loop", true);
    video.onerror(reject);
    video.muted = true;

    video.onloadedmetadata = async () => {
      const stream = video.captureStream();
      const [track] = stream.getVideoTracks();

      // eslint-disable-next-line
      const processor = new MediaStreamTrackProcessor(track);
      const frameStream = processor.readable;

      // Transfer the readable stream to the worker.
      // NOTE: transferring frameStream and reading it in the worker is more
      // efficient than reading frameStream here and transferring VideoFrames individually.
      this.$modV.store.dispatch(
        "videos/assignVideoStream",
        {
          id,
          stream: frameStream,
          width: video.videoWidth || 256,
          height: video.videoHeight || 256
        },
        [frameStream]
      );

      resolve();
    };

    video.setAttribute("src", url);
    await video.play();
  });
}
