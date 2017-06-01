class RGBDisplay extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'RGB Display',
				author: 'Daniil',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					cellSize: {
						type: 'i',
						value: 3.0
					}
				} // Three.JS uniforms
			},
			fragmentFile: "/RGB Display/rgbDisplay.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'cellSize',
			label: 'Cell Size',
			varType: 'int',
			min: 3,
			max: 30,
			step: 3,
			default: 3
		}));
	}

}

modV.register(RGBDisplay);