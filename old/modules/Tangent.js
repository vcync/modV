class Tangent extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Tangent',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					amount: {
						type: 'f',
						value: 0.5
					},
					centerX: {
						type: 'f',
						value: 0.5
					},
					centerY: {
						type: 'f',
						value: 0.5
					},
					spread: {
						type: 'f',
						value: 0.5
					}
				} // Three.JS uniforms
			},
			fragmentFile: "/Tangent/tangent.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'amount',
			label: 'Tangent Size',
			varType: 'float',
			min: 0.0,
			max: 1.0,
			step: 0.001,
			default: 0.5
		}));

		this.add(new modV.RangeControl({
			variable: 'spread',
			label: 'Spread',
			varType: 'float',
			min: 0.0,
			max: 1.0,
			step: 0.001,
			default: 0.5
		}));

		this.add(new modV.RangeControl({
			variable: 'centerX',
			label: 'Center X',
			varType: 'float',
			min: 0.0,
			max: 1.0,
			step: 0.001,
			default: 0.5
		}));

		this.add(new modV.RangeControl({
			variable: 'centerY',
			label: 'Center Y',
			varType: 'float',
			min: 0.0,
			max: 1.0,
			step: 0.001,
			default: 0.5
		}));
	}
}

modV.register(Tangent);