var Dither = new modVC.ModuleShader({
	info: {
		name: 'Dither',
		author: '2xAA',
		version: 0.1,
		meyda: [], // returned variables passed to the shader individually as uniforms
		controls: [], // variabled passed to the shader individually as uniforms
		uniforms: {
			scale: {
				type: 'f',
				value: 1.0
			}
		} // Three.JS uniforms
	},
	shaderFile: "/Dither/shader.html" // path to HTML file within modules directory with shader script tags
});

Dither.add(new modVC.RangeControl({
	variable: 'scale',
	label: 'Scale',
	varType: 'float',
	min: 0.0,
	max: 10.0,
	step: 0.001,
	default: 1.0
}));

modVC.register(Dither);