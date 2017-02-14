class Rotate extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Rotate',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					angle: {
						type: 'f',
						value: 0.0
					}
				} // Three.JS style uniforms
			},
			shaderFile: "/Rotate/shader.html" // path to HTML file within modules directory with shader script tags
		});
				
		this.add(new modV.RangeControl({
			variable: 'angle',
			label: 'Angle',
			varType: 'float',
			min: -360.0,
			max: 360.0,
			step: 0.1,
			default: 0.0
		}));
	}
}

modV.register(Rotate);