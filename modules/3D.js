class iiiD extends modV.Module3D {
	constructor() {
		super({
			info: {
				name: '3D',
				author: '2xAA',
				version: 0.1,
				previewWithOutput: false
			}
		});

		this.add(new modV.RangeControl({
			variable: 'size',
			label: 'Size',
			varType: 'float',
			min: 1,
			max: 20,
			step: 0.2,
			default: 1
		}));

		this.add(new modV.RangeControl({
			variable: 'speed',
			label: 'Speed',
			varType: 'int',
			min: 0,
			max: 20,
			step: 1,
			default: 0
		}));
	}
	
	init(canvas, scene, camera, material, texture) {

		this.size = 1;
		this.speed = 0;

		var aspect = canvas.width / canvas.height;
		var d = 12;

		var VIEW_ANGLE = 45,
			ASPECT = canvas.width / canvas.height,
			NEAR = 0.1,
			FAR = 10000;

		camera = new THREE.PerspectiveCamera(VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR
		);

		/*camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );*/
		camera.position.z = 30;

		this.geometry = new THREE.IcosahedronGeometry( 5, 0 );
		this.ico = new THREE.Mesh(this.geometry, material);
		scene.add(this.ico);

		this.setScene(scene);
		this.setCamera(camera);
	}
	
	resize(canvas, scene, camera, material, texture) {
		var WIDTH = canvas.width,
			HEIGHT = canvas.height;
		
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	}

	draw(scene, camera, material, texture, features) {
		this.ico.rotation.x += this.speed * 0.005;
		this.ico.rotation.y += this.speed * 0.01;
		var scale = this.size + features.rms;
		this.ico.scale.set(scale, scale, scale);
	}
}

modV.register(iiiD);