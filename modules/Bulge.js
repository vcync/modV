var Bulge = new modVC.ModuleShader({
	info: {
		name: 'Bulge',
		author: '2xAA',
		version: 0.1,
		meyda: [], // returned variables passed to the shader individually as uniforms
		controls: [], // variabled passed to the shader individually as uniforms
		uniforms: {
			amount: {
				type: 'f',
				value: 0.5
			}
		} // Three.JS uniforms
	},
	shaderFile: "/Bulge/shader.html" // path to HTML file within modules directory with shader script tags
});

Bulge.add(new modVC.RangeControl({
    variable: 'amount',
    label: 'Bulge Size',
    varType: 'float',
    min: 0.0,
    max: 1.14,
    step: 0.001,
    default: 0.5
}));

modVC.register(Bulge);