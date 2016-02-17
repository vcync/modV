var Pinch = new modVC.ModuleShader({
	info: {
		name: 'Pinch',
		author: '2xAA',
		version: 0.1,
		meyda: [], // returned variables passed to the shader individually as uniforms
		controls: [], // variabled passed to the shader individually as uniforms
		uniforms: {} // Three.JS uniforms
	},
	shaderFile: "/Pinch/shader.html" // path to HTML file within modules directory with shader script tags
});

modVC.register(Pinch);