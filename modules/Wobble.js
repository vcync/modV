class Wobble extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Wobble',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
			        strength: {
			            type: "f",
			            value: 0.001
			        },
			        size: {
			            type: "f",
			            value: 1.0
			        }
				} // Three.JS style uniforms
			},
			fragmentFile: "/Wobble/wobble.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'strength',
			label: 'Strength',
			varType: 'float',
			min: 0.0,
			max: 0.05,
			step: 0.001,
			default: 0.001
		}));

		this.add(new modV.RangeControl({
			variable: 'size',
			label: 'Size',
			varType: 'float',
			min: 1,
			max: 50,
			step: 1.0,
			default: 1.0
		}));

		// this.add(new modV.RangeControl({
		// 	variable: 'speed',
		// 	label: 'Speed',
		// 	varType: 'float',
		// 	min: 1.0,
		// 	max: 2.0,
		// 	step: 0.001,
		// 	default: 1.03
		// }));
	}
}

modV.register(Wobble);