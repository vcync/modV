//jshint node:true

console.log('      modV Copyright  (C)  2016 Sam Wray      '+ "\n" +
            '----------------------------------------------'+ "\n" +
            '      modV is licensed  under GNU GPL V3      '+ "\n" +
            'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
            'For details, see LICENSE within this directory'+ "\n" +
            '----------------------------------------------');

const webpack = require('webpack-stream');
const connect = require('gulp-connect');
const jshint = require('gulp-jshint');
const symlink = require('gulp-sym');
const mkdirp = require('mkdirp');
const clean = require('gulp-clean');
const ejs = require('gulp-ejs');
const gulp = require('gulp');
const fs = require('fs');

const exec = require('child_process').exec;

const NwBuilder = require('nw-builder');

var allSources = ['./src/**/*.js', './**/*.ejs', './modules/**/*.js', './modules/**/*.html', './*.html']; // , './**/*.css'

gulp.task('clean', function() {
	return gulp.src('./dist', {read: false})
		.pipe(clean());
});

gulp.task('clean:nwjs', function() {
	return gulp.src('./nwjs/build', {read: false})
		.pipe(clean());
});

gulp.task('lint', function() {
	return gulp.src('./src/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
		//.pipe(jshint.reporter('fail'));
});

gulp.task('webpack', ['clean', 'lint'], function() {
	return gulp.src('./src/**/*.js')
		.pipe(webpack({
			output: {
				filename: 'app.js'
			}
		}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('copy:modules', ['clean'], function() {
	return gulp.src('./modules/**/*', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:html', ['clean'], function() {
	return gulp.src('./*.{htm,html}', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:css', ['clean'], function() {
	return gulp.src('./*.css', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:library', ['clean'], function() {
	return gulp.src('./libraries/**/*', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:meyda', ['clean'], function() {
	return gulp.src('node_modules/meyda/dist/web/meyda.js')
		.pipe(gulp.dest('dist/libraries'));
});

gulp.task('copy:fonts', ['clean'], function() {
	return gulp.src('./fonts/**/*', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:license', ['clean'], function() {
	return gulp.src('./LICENSE', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:include', ['clean'], function() {
	return gulp.src('./nwjs/nwjs-include.js')
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:package', ['clean'], function() {
	return gulp.src('./nwjs/package.json')
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:mediamanager', ['clean'], function() {
	return gulp.src('./mediaManager.js')
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:mediamanagermodules', ['clean'], function(cb) {

	// read npm package and copy mediaManager dependancies to dist, for nwjs build
	var package = JSON.parse(fs.readFileSync('package.json', 'utf8'));
			
	var foldersToCopy = [];

	for(var dep in package.dependencies) {

		foldersToCopy.push('./node_modules/' + dep + '/**/*');
	
	}

	return gulp.src(foldersToCopy, {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('symlink', ['clean'], function() {
	return gulp.src('./media', {base: './'})
		.pipe(symlink('dist/media'));
});

gulp.task('ejs', ['clean'], function() {
	return gulp.src('./*.ejs', {base: './'})
		.pipe(ejs({nwjs: false}, {
			ext: '.html'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('ejs:nwjs', ['clean'], function() {
	return gulp.src('./*.ejs', {base: './'})
		.pipe(ejs({nwjs: true}, {
			ext: '.html'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('media-manager', ['set-watcher'], function(cb) {

	var mediaManager = exec('node ./mediaManager.js', function(err) {
		if(err) cb(err);
	});

	mediaManager.stdout.on('data', function(data) {
	    console.log(data.toString()); 
	});

	//return run('node ./mediaManager.js').exec();
});

gulp.task('connect', function() {
	connect.server({
		root: './dist/',
		livereload: true,
		port: 3131
	});
});

gulp.task('reload', ['build'], function() {
	gulp.src(allSources)
    	.pipe(connect.reload());
});

gulp.task('set-watcher', ['build'], function() {
	var sources = '';
	allSources.forEach((source, idx) => {
		sources += source;
		if(idx < allSources.length-1) sources += ", ";
	});
	
	console.log('Watching', sources);
	gulp.watch(allSources, ['build', 'reload']);
});

gulp.task('nwjs', ['clean', 'ejs:nwjs', 'webpack', 'copy', 'copy:nwjs:include', 'copy:nwjs:package', 'copy:nwjs:mediamanager', 'copy:nwjs:mediamanagermodules', 'clean:nwjs'], function(cb) {
	mkdirp.sync('./dist/media/');

	var nw = new NwBuilder({
		files: './dist/**/**',
		platforms: ['osx64', 'win64'],
		flavor: 'normal',
		cacheDir: './nwjs/cache',
		buildDir: './nwjs/build'
	});

	nw.on('log', console.log);

	return nw.build().then(function () {
		console.log('NWJS build done!');
	}).catch(function(error) {
		cb(error);
	});
});

gulp.task('copy', ['copy:modules', 'copy:html', 'copy:css', 'copy:library', 'copy:meyda', 'copy:fonts', 'copy:license']);

gulp.task('build', ['clean', 'ejs', 'webpack', 'copy', 'symlink']);

gulp.task('build-nwjs', ['clean', 'ejs:nwjs', 'webpack', 'copy', 'nwjs']);

gulp.task('watch', ['build', 'connect', 'set-watcher', 'media-manager']);

gulp.task('watch-only', ['build', 'connect', 'set-watcher']);