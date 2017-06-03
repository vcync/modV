export default function scanMediaStreamSources() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const sources = {
        audio: [],
        video: []
      };

      devices.forEach((device) => {
        if(device.kind === 'audioinput') {
          sources.audio.push(device);
        } else if(device.kind === 'videoinput') {
          sources.video.push(device);
        }
      });

      return sources;
    }).then(resolve).catch(reject);
  });
}