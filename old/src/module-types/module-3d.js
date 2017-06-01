const Module = require('./module');
const THREE = require('three');

module.exports = function(modV) {

	/**
	 * @extends Module
	 */
	class Module3D extends Module {

		/**
		 * @param {ModuleSettings} settings
		 */
		constructor(settings) {
			super(settings);
			this._scene = new THREE.Scene();
			this._camera = null;
		}

		/**
		 * Called when the Module is first initiated
		 * @override
		 * @param  {HTMLCanvas}     canvas   A 2D Canvas (internally, from the Layer containing the Module)
		 * @param  {THREE.Scene}    scene    The Scene Object stored in the Module3D instance
		 * @param  {THREE.Material} material modV's output canvas material
		 * @param  {THREE.Texture}  texture  modV's output canvas texture
		 */
		init(canvas, scene, material, texture) {} //jshint ignore:line

		/**
		 * Called each frame to update the Module
		 * @param  {THREE.Scene}    scene         The Scene Object stored in the Module3D instance
		 * @param  {THREE.Camera}   camera        The Camera Object stored in the Module3D instance
		 * @param  {THREE.Material} material      modV's output canvas material
		 * @param  {THREE.Texture}  texture       modV's output canvas texture
		 * @param  {Array<MeydaFeature>}          meydaFeatures Requested Meyda features
		 */
		draw(scene, camera, material, texture, meydaFeatures) {} //jshint ignore:line

		/**
		 * Called when an output window canvas resizes
		 * @override
		 * @param  {HTMLCanvas}     canvas   The resized Canvas
		 * @param  {THREE.Scene}    scene    The Scene Object stored in the Module3D instance
		 * @param  {THREE.Camera}   camera   The Camera Object stored in the Module3D instance
		 * @param  {THREE.Material} material modV's output canvas material
		 * @param  {THREE.Texture}  texture  modV's output canvas texture
		 */
		resize(canvas, scene, camera, material, texture) {} //jshint ignore:line

		/**
		 * Sets the Scene Object for the Module3D instance
		 * @param {THREE.Scene} scene [description]
		 * @see {@link https://threejs.org/docs/#Reference/Scenes/Scene}
		 */
		setScene(scene) {
			this._scene = scene;
		}

		/**
		 * Gets the Scene Object stored in the Module3D instance
		 * @param {THREE.Scene} scene [description]
		 */
		getScene() {
			return this._scene;
		}

		/**
		 * Gets the Camera Object stored in the Module3D instance
		 * @param {THREE.Camera} scene [description]
		 */
		getCamera() {
			return this._camera;
		}

		/**
		 * Sets the Camera Object for the Module3D instance
		 * @param {THREE.Camera} scene [description]
		 * @see {@link https://threejs.org/docs/#Reference/Cameras/Camera}
		 */
		setCamera(camera) {
			this._camera = camera;
		}
	}

	/**
	 * @name Module3D
	 * @memberOf modV
	 * @type {Module3D}
	 */
	modV.prototype.Module3D = Module3D;
};