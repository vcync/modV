class SlipNSlideShader extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Slip N Slide Shader',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
			        slices: {
			            type: 'f',
			            value: 10.0
			        },
			        offset: {
			            type: 'f',
			            value: 0.03
			        },
					timeMultiplier: {
						type: 'f',
						value: 1.0
					}
				} // Three.JS style uniforms
			},
			fragmentFile: "/SlipNSlideShader/slipNSlide.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'slices',
			label: 'Slices',
			varType: 'float',
			min: 1.0,
			max: 200.0,
			step: 1.0,
			default: 10.0
		}));

		this.add(new modV.RangeControl({
			variable: 'offset',
			label: 'Offset',
			varType: 'float',
			min: 0.0,
			max: 0.5,
			step: 0.001,
			default: 0.03
		}));

		this.add(new modV.RangeControl({
			variable: 'timeMultiplier',
			label: 'Time Multiplier',
			varType: 'float',
			min: 0.0,
			max: 3.0,
			step: 0.01,
			default: 1.0
		}));

	}
}

modV.register(SlipNSlideShader);