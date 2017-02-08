class HueSat extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Hue Saturation',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					hue: {
						type: 'f',
						value: 0.0
					},
					saturation: {
						type: 'f',
						value: 0.0
					}
				} // Three.JS style uniforms
			},
			shaderFile: "/Hue-Saturation/shader.html" // path to HTML file within modules directory with shader script tags
		});
				
		this.add(new modV.RangeControl({
			variable: 'hue',
			label: 'Hue',
			varType: 'float',
			min: -1.0,
			max: 1.0,
			step: 0.001,
			default: 0.0
		}));

		this.add(new modV.RangeControl({
			variable: 'saturation',
			label: 'Saturation',
			varType: 'float',
			min: -1.0,
			max: 1.0,
			step: 0.001,
			default: 0.0
		}));
	}
}

modV.register(HueSat);