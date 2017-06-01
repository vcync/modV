class Stretch extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Stretch',
				author: '2xAA',
				version: 0.1,
				meyda: ['rms'], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					intensity: {
						type: 'f',
						value: 1.0
					}
				} // Three.JS uniforms
			},
			fragmentFile: "/Stretch/stretch.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'intensity',
			label: 'Intensity',
			varType: 'float',
			min: 0.0,
			max: 6.0,
			step: 0.001,
			default: 1.0
		}));
	}

}

modV.register(Stretch);