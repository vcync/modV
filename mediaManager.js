//jshint node:true

const ws = require('nodejs-websocket'),
	mkdirp = require('mkdirp'),
	dive = require('dive'),
	fs = require('fs'),
	fsp = require('fs-promise'),
	path = require('path'),
	animated = require('animated-gif-detector'),
	ffmpeg = require('fluent-ffmpeg'),
	watch = require('node-watch'),
	open = require("open");

var isWin = /^win/.test(process.platform);
var pathSeparator = "/";
if(isWin) pathSeparator = "\\";

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

function createDirectories(callback) {
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
			console.log('Profile found: ', dir);
		} else {
			// This should never error
			// If it does, we're screwed
			throw 'Somehow two directories with the same name in the same directory were discovered. Please check this and try again.';
		}

		// Create folders that need to exist
		/* According to the NodeJS docs, this is the recommended way
		   to check if a directory exists (i.e. just go for it and
	   	catch the errors) */

		fs.open(cwd + '/media/' + dir + '/image', 'r', function(err) {
			if(err && err.code === 'ENOENT') {
				fs.mkdir(cwd + '/media/' + dir + '/image');
			}
		});

		fs.open(cwd + '/media/' + dir + '/video', 'r', function(err) {
			if(err && err.code === 'ENOENT') {
				fs.mkdir(cwd + '/media/' + dir + '/video');
			}
		});

		fs.open(cwd + '/media/' + dir + '/preset', 'r', function(err) {
			if(err && err.code === 'ENOENT') {
				fs.mkdir(cwd + '/media/' + dir + '/preset');
			}
		});

		fs.open(cwd + '/media/' + dir + '/palette', 'r', function(err) {
			if(err && err.code === 'ENOENT') {
				fs.mkdir(cwd + '/media/' + dir + '/palette');
			}
		});

	});
	callback();
}

/* Server */
var clients = [];

function update(conn) {
	console.log('Sending client profiles data');
	conn.send(JSON.stringify({type: 'update', payload: profiles}));
}

var server = ws.createServer(function(conn) {
	console.log('_New ws client_');

	var clientIndex = clients.push(conn)-1;
	conn.clientIndex = clientIndex;

	conn.on('close', function() {
		clients.splice(conn.clientIndex, 1);
	});

	conn.on('text', function(msg) {
		var parsed = JSON.parse(msg);
		console.log('Received message from websocket client: ' + msg);

		if('request' in parsed) {

			switch(parsed.request) {
				case 'update':
					update(conn);

				break;

				case 'save-preset':
					console.log('Attempting to save preset in profile:', parsed.profile);

					if(parsed.profile.trim() === "") {
						console.log("Could not save preset, empty name");
						conn.send(JSON.stringify({
							'error': 'save-preset',
							'message': 'Could not save preset',
							'reason': 'Empty name'
						}));
						return;
					}

					var outputPresetFilename = './media/' + parsed.profile + '/preset/' + parsed.name + '.json';
					var dir = './media/' + parsed.profile + '/preset/';

					mkdirp.sync(dir);

					fs.writeFile(outputPresetFilename, JSON.stringify(parsed.payload), function(err) {
						if(err) {
							throw err;
						} else {
							console.log('JSON saved to ' + outputPresetFilename);
						}
					});

				break;

				case 'save-palette':
					console.log('Attempting to save palette in profile:', parsed.profile);

					var outputPaletteFilename = './media/' + parsed.profile + '/palette/' + parsed.name + '.json';

					fs.writeFile(outputPaletteFilename, JSON.stringify(parsed.payload), function(err) {
						if(err) {
							throw err;
						} else {
							console.log('JSON saved to ' + outputPaletteFilename);
							console.log('Adding palette to profiles object then sending back to client.');
							profiles[parsed.profile].palettes[parsed.name] = parsed.payload;
							update(conn);
						}
					}); 

				break;
			}

		}
	});
});

var mediaDir = cwd + pathSeparator + 'media';

/* Slosh through media dir */
function mediaSearch(callback) {
	dive(mediaDir, { all: false }, function(err, file) {

		if(err) throw err;
		var pathReplaced = file.replace(mediaDir, '');
		pathReplaced = pathReplaced.split(pathSeparator);

		var dirSplit = file.split(pathSeparator);

		var profile 	= pathReplaced[1];
		var directory 	= pathReplaced[2];
		var filename 	= dirSplit[dirSplit.length-1].split('.')[0];
		var fileExt		= file.split('.').pop();
		var filePath	= file.replace(cwd, '.');
		var fileParsed;


		if(directory === 'palette') {
			fsp.readFile(file, 'utf8').then(contents => {
				fileParsed = JSON.parse(contents);
				profiles[profile].palettes[filename] = fileParsed;
				console.log('🎨  Found palette in', profile + ':', filename);
				clients.forEach(client => {
					update(client);
				});
			});
		}

		if(directory === 'preset') {
			fsp.readFile(file, 'utf8').then(contents => {
				fileParsed = JSON.parse(contents);
				profiles[profile].presets[filename] = fileParsed;
				console.log('💾  Found preset data in', profile + ':', filename);
				clients.forEach(client => {
					update(client);
				});
			});
		}
		
		if(fileExt.toLowerCase() in viableVideo) {
			profiles[profile].files.videos.push({'name': filename, 'path': filePath});
			console.log('📼  Found video in', profile + ':', filename);
			clients.forEach(client => {
				update(client);
			});
		}

		if(fileExt.toLowerCase() in viableImage) {
			console.log('📷  Found image in', profile + ':', filename);

			if(fileExt.toLowerCase() === 'gif' && animated(fs.readFileSync(filePath))) {

				console.log('Animated GIF detected:', filePath);
				var outputFile = cwd + '/media/' + profile + '/video/' + filename + '.mp4';

				// Check if we need to convert
				fs.open(outputFile, 'r', function(err) {
					if(err && err.code === 'ENOENT') {
						
						console.log('Converting', filePath, 'to MP4');

						ffmpeg(filePath)
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
		console.log('👍  Finished sloshing through media');
		callback();
	});
}

var port = 3132;

createDirectories(function() {
	mediaSearch(function() {
		server.listen(port, function() {

			console.log('modV Media Manager listening on port', port);
			console.log('Watching ./media/ for changes...');

			watch('./media/', { recursive: true, followSymLinks: true }, function(filepath) {

				if(path.parse(filepath).base !== '.DS_Store') {
					console.log(filepath, ' changed - updating media and sending to clients');
					
					profiles = {};
					createDirectories(function() {
						mediaSearch(function() {
							clients.forEach(client => {
								update(client);
							});
						});
					});
				}

			});

		});
	});
});

exports.openMediaFolder = function() {
	open(process.cwd() + '/media');
};