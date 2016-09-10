class ChrAbberation extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Chromatic Abberation',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					rOffset: {
						type: 'f',
						value: -0.001
					},
					gOffset: {
						type: 'f',
						value: 0.0
					},
					bOffset: {
						type: 'f',
						value: 0.001
					}
				} // Three.JS style uniforms
			},
			shaderFile: "/Default Shader/shader.html" // path to HTML file within modules directory with shader script tags
		});
				
		this.add(new modV.RangeControl({
			variable: 'rOffset',
			label: 'Red Offset',
			varType: 'float',
			min: -0.5,
			max: 0.5,
			step: 0.001,
			default: -0.001
		}));

		this.add(new modV.RangeControl({
			variable: 'gOffset',
			label: 'Green Offset',
			varType: 'float',
			min: -0.5,
			max: 0.5,
			step: 0.001,
			default: 0.0
		}));

		this.add(new modV.RangeControl({
			variable: 'bOffset',
			label: 'Blue Offset',
			varType: 'float',
			min: -0.5,
			max: 0.5,
			step: 0.001,
			default: 0.001
		}));
	}
}

modV.register(ChrAbberation);