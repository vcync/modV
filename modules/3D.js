var iiiD = new modVC.Module3D({
	info: {
		name: '3D',
		author: '2xAA',
		version: 0.1,
		previewWithOutput: false
	},
	init: function(canvas, scene, camera, material, texture) {

		console.log(scene);

		var aspect = canvas.width / canvas.height;
		var d = 12;
		camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
		camera.position.z = 400;

		this.geometry = new THREE.IcosahedronGeometry( 5, 0 );
		this.ico = new THREE.Mesh(this.geometry, material);
		scene.add(this.ico);

		this.setScene(scene);
		this.setCamera(camera);
	},
	resize: function(canvas, scene, camera, material, texture) {
		var WIDTH = canvas.width,
			HEIGHT = canvas.height;
		
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	},
	draw: function(scene, camera, material, texture, features) {
		this.ico.rotation.x += 0.005;
		this.ico.rotation.y += 0.01;
		var scale = 1+features.rms;
		this.ico.scale.set(scale, scale, scale);
	}
});

modVC.register(iiiD);