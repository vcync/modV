var threeJS = function() {

	this.info = {
		name: 'threeJS',
		author: '2xAA',
		version: 0.1,
		threejs: true,
		meyda: ['zcr']
	};
	var hue = 0;
	var analysed;
	var colour = new THREE.Color(0xffffff);
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var clock = new THREE.Clock();
	var cube = new THREE.Mesh( geometry, material );

	modV.threejs.camera.position.z = /*40*/5;

	var xaa;
	var loader = new THREE.JSONLoader();

	var startPos = 2.2;
	var rotSpeed =  0.003;

	var material = new THREE.MeshLambertMaterial({
		wireframe: false,
		color: 0xff0000,
		specular: '#ffffff',
		shading: THREE.SmoothShading,
		emissive: 0x003254,
		shininess: 1,
		wrapAround: false,
		fog: false,
		reflectivity: 1
	});

	var lights = [];
	lights[0] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[1] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[2] = new THREE.PointLight( 0xffffff, 1, 0 );
	
	lights[0].position.set( 0, 200, 0 );
	lights[1].position.set( 100, 200, 100 );
	lights[2].position.set( -100, -200, -100 );

	modV.threejs.scene.add( lights[0] );
	modV.threejs.scene.add( lights[1] );
	modV.threejs.scene.add( lights[2] );

	loader.load('2xAA.json', function(geometry, materials) {
		xaa = new THREE.Mesh(
			geometry,
			material
		);

		modV.threejs.scene.add(xaa);
		xaa.rotation.x = -5.3;
		xaa.scale.set( 2, 2, 2 );

		xaa.position.set( 0, -0.46, 0 );
		modV.threejs.camera.position.set( 6, 8, 0 );
		modV.threejs.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	});

	this.draw = function(canvas, ctx, audio, video, meyda) {
		analysed = meyda['zcr']/10;
		var elapsed = clock.getElapsedTime();

		xaa.rotation.y = -(elapsed+1300) / 2;
		xaa.rotation.x = -(elapsed+1300) / 5;

		colour.setHSL(hue, 1, 0.5);
		material.color = colour;

		if(hue >= 1) hue = 0;
		else hue+=0.001;
	};
};