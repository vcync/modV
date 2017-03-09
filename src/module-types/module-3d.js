const Module = require('./module');
const THREE = require('three');

module.exports = function(modV) {
	modV.prototype.Module3D = class Module3D extends Module {

		constructor(settings) {
			super(settings);
			this._scene = new THREE.Scene();
			this._camera = null;
		}

		setScene(scene) {
			this._scene = scene;
		}

		getScene() {
			return this._scene;
		}

		getCamera() {
			return this._camera;
		}

		setCamera(camera) {
			this._camera = camera;
		}
	};
};