class BarrelDistortion extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Barrel Distortion',
				author: 'nuclear',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					distortAmount: {
						type: 'f',
						value: 1.0
					}
				} // Three.JS uniforms
			},
			fragmentFile: "/Barrel Distortion/barrel.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'distortAmount',
			label: 'Distortion Amount',
			varType: 'float',
			min: -1.0,
			max: 1.0,
			step: 0.01,
			default: 1.0
		}));
	}

}

modV.register(BarrelDistortion);