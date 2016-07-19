var Video = new modVC.Module2D({
	info: {
		name: 'Video',
		author: '2xAA',
		version: 0.1,
		previewWithOutput: false
	},
	init: function(canvas) {
 		
		this.video = document.createElement('video');
		this.video.src = '';
		this.video.muted = true;
		this.video.loop = true;
		this.playbackRate = 1.0;

		this.canvas2 = document.createElement('canvas');
		this.ctx2 = this.canvas2.getContext('2d');

		this.canvas2.width = canvas.width;
		this.canvas2.height = canvas.height;
		
	},
	resize: function(canvas) {
		this.canvas2.width = canvas.width;
		this.canvas2.height = canvas.height;
	},
	draw: function(canvas, ctx) {

		try {
			this.video.playbackRate = this.playbackRate;
		} catch(e) {
			
		}
		this.ctx2.drawImage(this.video, 0, 0, canvas.width, canvas.height); 
		ctx.drawImage(this.canvas2, 0, 0, canvas.width, canvas.height);
	}
});

Video.add(new modVC.RangeControl({
	variable: 'playbackRate',
	label: 'Playback Rate',
	min: -1.0,
	max: 2.0,
	varType: 'float',
	step: 0.1
}));

Video.add(new modVC.VideoControl({
	variable: 'video',
	label: 'Video'
}));


modVC.register(Video);