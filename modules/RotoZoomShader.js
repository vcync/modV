class RotoZoomShader extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'RotoZoom Shader',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
			        u_angle: {
			            type: 'f',
			            value: 0.0
			        },
					u_timeMultiplier: {
						type: 'f',
						value: 1.0
					}
				} // Three.JS style uniforms
			},
			shaderFile: "/RotoZoomShader/shader.html" // path to HTML file within modules directory with shader script tags
		});
				
		this.add(new modV.RangeControl({
			variable: 'u_angle',
			label: 'Angle',
			varType: 'float',
			min: 0.0,
			max: 360.0,
			step: 1.0,
			default: 0.0
		}));

		this.add(new modV.RangeControl({
			variable: 'u_timeMultiplier',
			label: 'Time Multiplier',
			varType: 'float',
			min: 0.0,
			max: 3.0,
			step: 0.01,
			default: 1.0
		}));

	}
}

modV.register(RotoZoomShader);