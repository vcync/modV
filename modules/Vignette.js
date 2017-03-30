class Vignette extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Vignette',
				author: 'Ippokratis',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					intensity: {
						type: 'f',
						value: 15.0
					},
					extension: {
						type: 'f',
						value: 0.25
					}
				}
			},
			fragmentFile: "/Vignette/vignette.frag"
		});

		this.add(new modV.RangeControl({
			variable: 'intensity',
			label: 'Intensity',
			varType: 'float',
			min: 1.0,
			max: 100.0,
			step: 1.0,
			default: 15.0
		}));

		this.add(new modV.RangeControl({
			variable: 'extension',
			label: 'Extension',
			varType: 'float',
			min: 0.05,
			max: 2.5,
			step: 0.05,
			default: 0.25
		}));
	}

}

modV.register(Vignette);