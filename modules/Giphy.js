/* globals Giphy */
var GiphyModV = new modVC.Module2D({
	info: {
		name: 'Giphy',
		author: '2xAA',
		version: 0.1,
		previewWithOutput: false,
		scripts: [
			'giphy/giphy.min.js'
		]
	},
	init: function() {
		
		this.add(new modVC.CustomControl(this.createControls));

		this.add(new modVC.RangeControl({
			variable: 'playbackRate',
			label: 'Playback Rate',
			min: -1.0,
			max: 2.0,
			varType: 'float',
			step: 0.1
		}));

		this.initGiphy();

		this.video = document.createElement('video');
		this.video.src = '';
		this.video.muted = true;
		this.video.loop = true;
		this.playbackRate = 1.0;
		
	},
	draw: function(canvas, ctx) {

		try {
			this.video.playbackRate = this.playbackRate;
		} catch(e) {
			
		}
		ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height); 

	}
});

GiphyModV.initGiphy = function() {
	console.log('called init giphy');
	this.giphy = new Giphy('dc6zaTOxFJmzC');

	this.video = document.createElement('video');
	this.video.src = '';
	this.video.muted = true;
	this.video.loop = true;
	this.playbackRate = 1.0;
};

GiphyModV.createControls = function(Module) {

	console.log(Module.video);

	if(typeof Module.giphy === "undefined") {
		console.log('creating new giphy');
		Module.initGiphy();
	}

	var giphyControlWrap = document.createElement('div');

	var gifGallery = document.createElement('div');

	var searchField = document.createElement('input');
	searchField.type = "text";
	searchField.addEventListener('keypress', function(e) {

		if(e.keyCode === 13) {

			this.select();

			Module.giphy.search({
				q: this.value,
				offset: 0,
				rating: 'r',
				fmt: 'json',
				'limit': 10
			},
			function(success) {
				console.log(success);
				gifGallery.innerHTML = '';

				success.data.forEach(function(gif) {

					var img = document.createElement('img');
					img.src = gif.images.downsized.url;

					img.addEventListener('click', function() {

						var video = document.createElement('video');
						video.crossOrigin = "anonymous";
						video.muted = true;
						video.loop = true;
						video.playbackRate = Module.playbackRate;

						video.oncanplaythrough = function() {
							Module.video = video;
							// total frames, duration, fps, frame time
							console.log(parseInt(gif.images.original.frames), video.duration, gif.images.original.frames / video.duration, video.duration/gif.images.original.frames);
							video.oncanplaythrough = null;
							
						};

						video.src = gif.images.original.mp4;
						video.play();					

					});

					gifGallery.appendChild(img);

				});

			},
			function(e) {
				console.error('Giphy: Could not connect to Giphy', e);
			});

		}

	});

	giphyControlWrap.appendChild(searchField);
	giphyControlWrap.appendChild(gifGallery);

	return giphyControlWrap;

};

modVC.register(GiphyModV);