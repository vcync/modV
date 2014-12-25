var video = function() {
	this.info = {
		name: 'video',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'video', variable: 'video', label: 'Drag a vid here, bae'}
		]
	};
	
	this.video = document.createElement('video');
	this.video.src = 'test.mp4';
	this.video.muted = true;
	
	this.draw = function(canvas, ctx, audio, video) {
		ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height); 
	};
};