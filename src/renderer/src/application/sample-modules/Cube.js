export default {
  meta: {
    name: "Cube",
    author: "2xAA",
    type: "three",
  },

  props: {
    rotation: {
      type: "vec3",
      default: [0, 0, 0],
      min: 0,
      max: 1,
    },

    scale: {
      type: "vec3",
      default: [1, 1, 1],
      min: 0,
      max: 1,
    },

    position: {
      type: "vec3",
      default: [0, 0, 0],
      min: 0,
      max: 1,
    },

    color: {
      type: "color",
      default: {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
      },
    },

    useMap: {
      type: "bool",
      default: false,
    },
  },

  data: {
    cubeMesh: null,
  },

  setupThree({ THREE, data, width, height, inputTexture }) {
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    camera.position.z = 5;

    const scene = new THREE.Scene();
    scene.background = null;

    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.351,
      map: inputTexture,
    });
    const cubeMesh = new THREE.Mesh(geometry, material);

    scene.add(cubeMesh);
    data.cubeMesh = cubeMesh;

    return { data, camera, scene };
  },

  resize({ canvas: { width, height }, camera }) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  },

  draw({
    THREE,
    data,
    props: {
      scale,
      position,
      rotation,
      color: { r, g, b },
      useMap,
    },
    inputTexture,
  }) {
    data.cubeMesh.position.x = position[0];
    data.cubeMesh.position.y = position[1];
    data.cubeMesh.position.z = position[2];

    data.cubeMesh.scale.x = scale[0];
    data.cubeMesh.scale.y = scale[1];
    data.cubeMesh.scale.z = scale[2];

    data.cubeMesh.rotation.x = rotation[0] * 360 * THREE.Math.DEG2RAD;
    data.cubeMesh.rotation.y = rotation[1] * 360 * THREE.Math.DEG2RAD;
    data.cubeMesh.rotation.z = rotation[2] * 360 * THREE.Math.DEG2RAD;

    if (useMap && !data.cubeMesh.material.map) {
      data.cubeMesh.material.map = inputTexture;
      data.cubeMesh.material.needsUpdate = true;
    } else if (!useMap && data.cubeMesh.material.map) {
      data.cubeMesh.material.map = undefined;
      data.cubeMesh.material.needsUpdate = true;
    }

    data.cubeMesh.material.color.r = r;
    data.cubeMesh.material.color.g = g;
    data.cubeMesh.material.color.b = b;
  },
};
