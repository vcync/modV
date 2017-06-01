class FilmGrain extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Film Grain',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					strength: {
						type: 'f',
						value: 16.0
					},
					secondaryOperation: {
						type: 'b',
						value: false
					}
				} // Three.JS style uniforms
			},
			fragmentFile: "/FilmGrain/filmGrain.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'strength',
			label: 'Strength',
			varType: 'float',
			min: 0.0,
			max: 50.0,
			step: 0.5,
			default: 16.0
		}));

		this.add(new modV.CheckboxControl({
			variable: 'secondaryOperation',
			label: 'Operation Type',
			checked: false
		}));
	}
}

modV.register(FilmGrain);