import store from "@/store";

export default function textureResolve(sourceDef) {
  return new Promise(resolve => {
    const { source, sourceData } = sourceDef;

    switch (source) {
      case "layer": {
        if (sourceData < 0) resolve(false);
        resolve({
          ...sourceDef,
          texture: store.state.layers.layers[sourceData].canvas
        });
        break;
      }

      case "image": {
        const image = new Image();
        image.onload = () => resolve({ ...sourceDef, texture: image });
        image.crossOrigin = "anonymous";
        image.src = sourceData;
        break;
      }

      case "video": {
        const video = document.createElement("video");
        video.oncanplay = () => {
          video.loop = true;
          video.volume = 0;
          resolve({ ...sourceDef, texture: video });
        };
        video.crossOrigin = "anonymous";
        video.src = sourceData;
        video.play();
        break;
      }

      default: {
        resolve(false);
        break;
      }
    }
  });
}
