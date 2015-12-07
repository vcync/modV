var restify = require('restify'),
	dive = require('dive'),
	ws = require('watershed'),
	fs = require('fs'),
	path = require('path'),
	animated = require('animated-gif-detector'),
	ffmpeg = require('fluent-ffmpeg');

ws = new ws.Watershed();

var profiles = {},
	cwd = process.cwd();

/* Viable file formats */
var viableVideo = {
	'mp4': true,
	'm4v': true,
	'webm': true,
	'ogv': true
};

var viableImage = {
	'jpg': true,
	'jpeg': true,
	'png': true,
	'gif': true
};

// List all profiles
function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}

var directories = getDirectories(path.resolve('./media'));

directories.forEach(function(dir) {

	if(!(dir in profiles)) { //TODO: redundant if statement??
		profiles[dir] = {
			presets: {},
			palettes:{},
			files: {
				images: [],
				videos: []
			}
		}; // Create new profile
		console.log('New profile created: ', dir);
	} else {
		// This should never error
		// If it does, we're screwed
		throw 'Somehow two directories with the same name in the same directory were discovered.\nPlease check this and try again.';
	}

	// Create folders that need to exist
	/* According to the NodeJS docs, this is the recommended way
	   to check if a directory exists (i.e. just go for it and
   	catch the errors) */

	fs.open(cwd + '/media/' + dir + '/image', 'r', function(err, fd) {
		if(err && err.code == 'ENOENT') {
			fs.mkdir(cwd + '/media/' + dir + '/image');
		}
	});

	fs.open(cwd + '/media/' + dir + '/video', 'r', function(err, fd) {
		if(err && err.code == 'ENOENT') {
			fs.mkdir(cwd + '/media/' + dir + '/video');
		}
	});

	fs.open(cwd + '/media/' + dir + '/preset', 'r', function(err, fd) {
		if(err && err.code == 'ENOENT') {
			fs.mkdir(cwd + '/media/' + dir + '/preset');
		}
	});

	fs.open(cwd + '/media/' + dir + '/palette', 'r', function(err, fd) {
		if(err && err.code == 'ENOENT') {
			fs.mkdir(cwd + '/media/' + dir + '/palette');
		}
	});

});

/* Server */
var server = restify.createServer({
	handleUpgrades: true,
	name: 'modV profile manager'
});

server.get('/', function upgradeRoute(req, res, next) {
	if (!res.claimUpgrade) {
		next(new Error('Connection Must Upgrade For WebSockets'));
		return;
	}

	console.log('_New ws client_');

	var upgrade = res.claimUpgrade();

	var shed = ws.accept(req, upgrade.socket, upgrade.head);

	function update() {
		console.log('\nSending client profiles data');
		shed.send(JSON.stringify({type: 'update', payload: profiles}));
	}

	shed.on('text', function(msg) {
		var parsed = JSON.parse(msg);
		console.log('\nReceived message from websocket client: ' + msg);

		if('request' in parsed) {

			switch(parsed.request) {
				case 'update':
					
					update();

				break;

				case 'save-preset':
					console.log('\nAttempting to save preset in profile:', parsed.profile);

					if(parsed.profile.trim() === "") {
						console.log("Could not save preset, empty name");
						shed.send(JSON.stringify({
							'error': 'save-preset',
							'message': 'Could not save preset',
							'reason': 'Empty name'
						}));
						return;
					}

					var outputPresetFilename = './media/' + parsed.profile + '/preset/' + parsed.name + '.json';

					fs.writeFile(outputPresetFilename, JSON.stringify(parsed.payload), function(err) {
						if(err) {
							throw err;
						} else {
							console.log('JSON saved to ' + outputPresetFilename);
						}
					}); 

				break;

				case 'save-palette':
					console.log('\nAttempting to save palette in profile:', parsed.profile);

					var outputPaletteFilename = './media/' + parsed.profile + '/palette/' + parsed.name + '.json';

					fs.writeFile(outputPaletteFilename, JSON.stringify(parsed.payload), function(err) {
						if(err) {
							throw err;
						} else {
							console.log('JSON saved to ' + outputPaletteFilename);
							console.log('Adding palette to profiles object then sending back to client.');
							profiles[parsed.profile].palettes[parsed.name] = parsed.payload;
							update();
						}
					}); 

				break;
			}

		}
	});

	next(false);
});

var mediaDir = cwd + '/media';

/* Slosh through media dir */
dive(mediaDir, { all: false }, function(err, file) {

	if(err) throw err;
	//console.log(file, file.split('.').pop());
	var pathReplaced = file.replace(mediaDir, '');
	pathReplaced = pathReplaced.split('/');

	var dirSplit = file.split('/');

	var profile 	= pathReplaced[1];
	var directory 	= pathReplaced[2];
	var filename 	= dirSplit[dirSplit.length-1].split('.')[0];
	var fileExt		= file.split('.').pop();
	var filePath	= file.replace(cwd, '.');
	var path 		= filePath.replace(filename + '.' + fileExt, '');
	var fileParsed;


	if(directory == 'palette') {
		fileParsed = JSON.parse(fs.readFileSync(file, 'utf8')); // sync because we don't want to finish before reading has occurred
		profiles[profile].palettes[filename] = fileParsed;
		console.log('🎨  Found palette in', profile);
	}

	if(directory == 'preset') {
		fileParsed = JSON.parse(fs.readFileSync(file, 'utf8')); // sync because we don't want to finish before reading has occurred
		profiles[profile].presets[filename] = fileParsed;
		console.log('💾  Found preset data in', profile);
	}

	if(fileExt.toLowerCase() in viableVideo) {

		profiles[profile].files.videos.push({'name': filename, 'path': filePath});
		console.log('📼  Found video in', profile);
	}

	if(fileExt.toLowerCase() in viableImage) {
		console.log('📷  Found image in', profile);

		if(fileExt.toLowerCase() === 'gif' && animated(fs.readFileSync(filePath))) {

			console.log('Animated GIF detected:', filePath);
			var outputFile = cwd + '/media/' + profile + '/video/' + filename + '.mp4';

			// Check if we need to convert
			fs.open(outputFile, 'r', function(err, fd) {
				if(err && err.code == 'ENOENT') {
					
					console.log('Converting', filePath, 'to MP4');

					var command = ffmpeg(filePath)
						.inputFormat('gif')
						.format('mp4')
						.noAudio()
						.videoCodec('libx264')
						.on('error', function(err) {
							console.log('An error occurred converting ' + filePath + ':', err.message);
						})
						.on('end', function() {
							console.log('Processing', filePath, 'finished!');
							profiles[profile].files.videos.push({'name': filename, 'path': outputFile.replace(cwd, '.')});
						})
						.save(outputFile);
				}
			});

		} else {
			profiles[profile].files.images.push({'name': filename, 'path': filePath});
		}
		
	}

	//profiles[profile]

}, function() {

	console.log('\n👍  Finished sloshing through media, here\'s what I got: \n');
	console.log(require('util').inspect(profiles, true, 10));

	server.listen(3132, function() {
		console.log('\n_%s listening at %s_', server.name, server.url);
	});

});