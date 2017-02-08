module.exports = function threeEnvInit() {
	let env = {};

	env.textureCanvas = document.createElement('canvas');
	env.textureCanvasContext = env.textureCanvas.getContext('2d');

	env.texture = new THREE.Texture(env.textureCanvas);
	env.texture.minFilter = THREE.LinearFilter;

	env.material = new THREE.MeshBasicMaterial({
		map: env.texture,
		side: THREE.DoubleSide
	});

	env.renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	env.renderer.setPixelRatio(window.devicePixelRatio);

	env.canvas = env.renderer.domElement;

	return env;
};