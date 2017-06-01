class BrightCont extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Brightess Contrast',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					brightness: {
						type: 'f',
						value: 0.0
					},
					contrast: {
						type: 'f',
						value: 1.0
					}
				} // Three.JS style uniforms
			},
			fragmentFile: "/Brightness-Contrast/brightCont.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'brightness',
			label: 'Brightness',
			varType: 'float',
			min: -1.0,
			max: 1.0,
			step: 0.001,
			default: 0.0
		}));

		this.add(new modV.RangeControl({
			variable: 'contrast',
			label: 'Contrast',
			varType: 'float',
			min: 0.0,
			max: 2.0,
			step: 0.001,
			default: 1.0
		}));
	}
}

modV.register(BrightCont);