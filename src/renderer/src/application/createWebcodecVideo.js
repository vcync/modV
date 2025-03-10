export function createWebcodecVideo({ id, url, textureDefinition }) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.setAttribute("crossorigin", "anonymous");
    video.setAttribute("loop", true);
    video.onerror = reject;
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
      this.store.dispatch(
        "videos/assignVideoStream",
        {
          id,
          stream: frameStream,
          width: video.videoWidth || 256,
          height: video.videoHeight || 256,
        },
        [frameStream],
      );

      resolve({ id, video, stream });
    };

    video.setAttribute("src", url);
    video.playbackRate = textureDefinition?.options?.playbackrate;
    if (textureDefinition?.options?.paused) {
      video.pause();
    } else {
      video.play();
    }
  });
}
