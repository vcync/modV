class Ripple extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Ripple',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					ripples: {
						type: 'f',
						value: 18.0
					},
					intensity: {
						type: 'f',
						value: 0.01
					},
					time: {
						type: 'f',
						value: 500.0
					}
				} // Three.JS uniforms
			},
			shaderFile: "/Ripple/shader.html" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'ripples',
			label: 'Ripples',
			varType: 'float',
			min: 0.0,
			max: 100.0,
			step: 1.0,
			default: 18.0
		}));

		this.add(new modV.RangeControl({
			variable: 'intensity',
			label: 'Intensity',
			varType: 'float',
			min: 0.0,
			max: 0.7,
			step: 0.001,
			default: 0.01
		}));

		this.add(new modV.RangeControl({
			variable: 'time',
			label: 'Time multiplier',
			varType: 'float',
			min: 100.0,
			max: 700.0,
			step: 1.0,
			default: 500.0
		}));
	}
	
}

modV.register(Ripple);