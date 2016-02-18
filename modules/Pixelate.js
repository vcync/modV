var Pixelate = new modVC.ModuleShader({
	info: {
		name: 'Pixelate',
		author: '2xAA',
		version: 0.1,
		meyda: [], // returned variables passed to the shader individually as uniforms
		controls: [], // variabled passed to the shader individually as uniforms
		uniforms: {
			amount: {
				type: 'f',
				value: 0.0
			}
		} // Three.JS uniforms
	},
	shaderFile: "/Pixelate/shader.html" // path to HTML file within modules directory with shader script tags
});

Pixelate.add(new modVC.RangeControl({
    variable: 'amount',
    label: 'Pixel Size',
    varType: 'float',
    min: 1.0,
    max: 200.0,
    step: 0.5,
    default: 90.0
}));

modVC.register(Pixelate);