class Pinch extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Pinch',
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
					}
				} // Three.JS uniforms
			},
			shaderFile: "/Pinch/shader.html" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'amount',
			label: 'Pinch Size',
			varType: 'float',
			min: 0.0,
			max: 4.0,
			step: 0.001,
			default: 2.0
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



modV.register(Pinch);