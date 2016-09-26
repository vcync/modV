class Kaleidoscope extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Kaleidoscope',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					sides: {
						type: 'f',
						value: 5.0
					}
				} // Three.JS uniforms
			},
			shaderFile: "/Kaleidoscope/shader.html" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'sides',
			label: 'Sides',
			varType: 'float',
			min: 2.0,
			max: 60.0,
			step: 1.0,
			default: 5.0
		}));
	}
}

modV.register(Kaleidoscope);