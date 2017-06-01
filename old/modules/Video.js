class Video extends modV.Module2D {
	constructor() {
		super({
			info: {
				name: 'Video',
				author: '2xAA',
				version: 0.1,
				previewWithOutput: false
			}
		});

		this.add(new modV.RangeControl({
			variable: 'playbackRate',
			label: 'Playback Rate',
			min: -1.0,
			max: 2.0,
			varType: 'float',
			step: 0.1
		}));

		this.add(new modV.VideoControl({
			variable: 'video',
			label: 'Video'
		}));
	}
	
	init(canvas) {
 		
		this.video = document.createElement('video');
		this.video.src = '';
		this.video.muted = true;
		this.video.loop = true;
		this.playbackRate = 1.0;

		this.canvas2 = document.createElement('canvas');
		this.ctx2 = this.canvas2.getContext('2d');

		this.canvas2.width = canvas.width;
		this.canvas2.height = canvas.height;
		
	}

	resize(canvas) {
		this.canvas2.width = canvas.width;
		this.canvas2.height = canvas.height;
	}

	draw(canvas, ctx) {

		try {
			this.video.playbackRate = this.playbackRate;
		} catch(e) {
			
		}

		this.ctx2.drawImage(this.video, 0, 0, canvas.width, canvas.height); 
		ctx.drawImage(this.canvas2, 0, 0, canvas.width, canvas.height);
	}
}

modV.register(Video);