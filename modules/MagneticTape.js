class MagneticTape extends modV.ModuleShader {
	constructor() {
		super({
			info: {
				name: 'Magnetic Tape',
				author: '2xAA',
				version: 0.1,
				meyda: [], // returned variables passed to the shader individually as uniforms
				controls: [], // variabled passed to the shader individually as uniforms
				uniforms: {
					diagonalSlideDistance: {
						type: 'f',
						value: 10.0
					},
					diagonalSlideOffset: {
						type: 'f',
						value: 4.0
					},
					scan1Value: {
						type: 'f',
						value: 2.0
					},
					scan2Value: {
						type: 'f',
						value: 2.0
					},
					timeMultiplier: {
						type: 'f',
						value: 1.0
					}
				} // Three.JS style uniforms
			},
			fragmentFile: "/MagneticTape/magneticTape.frag" // path to HTML file within modules directory with shader script tags
		});

		this.add(new modV.RangeControl({
			variable: 'diagonalSlideDistance',
			label: 'Diagonal Slide Distance',
			varType: 'float',
			min: 0.0,
			max: 25.0,
			step: 0.5,
			default: 10.0
		}));

		this.add(new modV.RangeControl({
			variable: 'diagonalSlideOffset',
			label: 'Diagonal Slide Offset',
			varType: 'float',
			min: 25.0,
			max: 0.0,
			step: 0.5,
			default: 4.0
		}));

		this.add(new modV.RangeControl({
			variable: 'scan1Value',
			label: 'Scan 1 Value',
			varType: 'float',
			min: 1.0,
			max: 10.0,
			step: 0.5,
			default: 2.0
		}));

		this.add(new modV.RangeControl({
			variable: 'scan2Value',
			label: 'Scan 2 Value',
			varType: 'float',
			min: 1.0,
			max: 10.0,
			step: 0.5,
			default: 2.0
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

modV.register(MagneticTape);