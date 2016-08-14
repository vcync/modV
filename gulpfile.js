//jshint node:true

var webpack = require('webpack-stream');
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var symlink = require('gulp-sym');
var clean = require('gulp-clean');
var ejs = require("gulp-ejs");
var run = require("gulp-run");
var gulp = require('gulp');

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

gulp.task('webpack', ['clean'], function() {
	return gulp.src('src/**/*.js')
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

gulp.task('media-manager', function() {
	return run('node ./mediaManager.js').exec();
});

gulp.task('connect', function() {
	connect.server({
		root: './dist/',
		livereload: true
	});
});

gulp.task('copy', ['copy:modules', 'copy:html', 'copy:css', 'copy:library']);

gulp.task('build', ['clean', 'lint', 'ejs', 'webpack', 'copy', 'symlink']);

gulp.task('watch', ['build', 'connect', 'media-manager'], function() {
	gulp.watch('./src/**/*.js', ['build']);
});