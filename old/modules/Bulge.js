class Bulge extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Bulge',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					aperture: {
						type: 'f',
						value: 180.0
					}/*,
					centerX: {
						type: 'f',
						value: 0.5
					},
					centerY: {
						type: 'f',
						value: 0.5
					}*/
				} // Three.JS uniforms
			},
			fragmentFile: "/Bulge/bulge.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'aperture',
			label: 'Aperture',
			varType: 'float',
			min: 0.0,
			max: 180.0,
			step: 1.0,
			default: 180.0
		}));

		/*this.add(new modV.RangeControl({
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
		}));*/
	}

}

modV.register(Bulge);