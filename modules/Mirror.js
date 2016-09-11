class Mirror extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Mirror',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					u_midPosition: {
						type: 'f',
						value: 0.5
					},
					u_direction: {
						type: 'b',
						value: false
					}
				} // Three.JS uniforms
			},
			shaderFile: "/Mirror/shader.html" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'u_midPosition',
			label: 'Mid position',
			varType: 'float',
			min: 0.0,
			max: 1.0,
			step: 0.01,
			default: 0.5
		}));
	}
}

modV.register(Mirror);