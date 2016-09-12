//jshint node:true

console.log('      modV Copyright  (C)  2016 Sam Wray      '+ "\n" +
            '----------------------------------------------'+ "\n" +
            '      modV is licensed  under GNU GPL V3      '+ "\n" +
            'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
            'For details, see LICENSE within this directory'+ "\n" +
            '----------------------------------------------');

var webpack = require('webpack-stream');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var symlink = require('gulp-sym');
var clean = require('gulp-clean');
var ejs = require('gulp-ejs');
var gulp = require('gulp');

var exec = require('child_process').exec;

var allSources = ['./src/**/*.js', './**/*.ejs', './modules/**/*.js', './modules/**/*.html', './*.html']; // , './**/*.css'

gulp.task('clean', function() {
	return gulp.src('./dist', {read: false})
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
	return gulp.src('node_modules/meyda/dist/web/meyda.js', {base: './libraries/'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:fonts', ['clean'], function() {
	return gulp.src('./fonts/**/*', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:license', ['clean'], function() {
	return gulp.src('./LICENSE', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('symlink', ['clean'], function() {
	return gulp.src('./media', {base: './'})
		.pipe(symlink('dist/media'));
});

gulp.task('ejs', ['clean'], function() {
	return gulp.src('./*.ejs', {base: './'})
		.pipe(ejs({}, {
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

gulp.task('copy', ['copy:modules', 'copy:html', 'copy:css', 'copy:library', 'copy:meyda', 'copy:fonts', 'copy:license']);

gulp.task('build', ['clean', 'ejs', 'webpack', 'copy', 'symlink']);

gulp.task('watch', ['build', 'connect', 'set-watcher', 'media-manager']);

gulp.task('watch-only', ['build', 'connect', 'set-watcher']);