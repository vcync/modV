//jshint node:true

console.log('      modV Copyright  (C)  2017 Sam Wray      '+ "\n" +
			'----------------------------------------------'+ "\n" +
			'      modV is licensed  under GNU GPL V3      '+ "\n" +
			'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
			'For details, see LICENSE within this directory'+ "\n" +
			'----------------------------------------------');
const MediaManager = require('modv-media-manager');
const webpack = require('webpack-stream');
const connect = require('gulp-connect');
const jshint = require('gulp-jshint');
const modclean = require('modclean');
const symlink = require('gulp-sym');
const merge = require('lodash.merge');
const clean = require('gulp-clean');
const exec = require('gulp-exec');
const ejs = require('gulp-ejs');
const gulp = require('gulp');

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

gulp.task('webpack', ['clean'], function() {
	return gulp.src(['src/app.js', './src/palette-worker/index.js'])
		.pipe(
			webpack(
				merge(
					{
						entry: {
							app: './src/app.js',
							'palette-worker': './src/palette-worker/index.js',
					    }
					},
					require('./webpack.config.js')
				),
				require('webpack') // pass webpack for webpack2
			)
		)
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

gulp.task('copy:fonts', ['clean'], function() {
	return gulp.src('./fonts/**/*', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:license', ['clean'], function() {
	return gulp.src('./LICENSE', {base: './'})
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:include', ['clean', 'clean:nwjs'], function() {
	return gulp.src('./nwjs/nwjs-include.js')
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:package', ['clean', 'clean:nwjs'], function() {
	return gulp.src('./nwjs/package.json')
		.pipe(gulp.dest('dist'));
});

gulp.task('copy:nwjs:mediamanager', ['clean', 'clean:nwjs'], function() {
	return gulp.src('./nwjs/media-manager.js')
		.pipe(gulp.dest('dist'));
});

gulp.task('nwjs:install', ['clean', 'clean:nwjs', 'copy:nwjs:package'], function() {
	return gulp.src('dist')
		.pipe(exec('cd ./dist/ && npm install --prefix <%= file.path %>'))
		.pipe(exec.reporter());
});

gulp.task('nwjs:modclean', ['nwjs:install'], function(cb) {
	modclean({ cwd: './dist/', patterns: ['default:safe', 'default:caution'] }, function(err, results) {
		if(err) {
			console.error(err);
			return;
		}

		console.log(`${results.length} files removed!`);
		cb();
	});
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

gulp.task('ejs:nwjs', ['clean', 'clean:nwjs'], function() {
	return gulp.src('./*.ejs', {base: './'})
		.pipe(ejs({nwjs: true}, {
			ext: '.html'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('media-manager', ['set-watcher'], function(cb) {
	new MediaManager(3132);
	cb();
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

gulp.task('nwjs', ['clean', 'clean:nwjs', 'ejs:nwjs', 'webpack', 'copy', 'copy:nwjs:include', 'copy:nwjs:package', 'copy:nwjs:mediamanager', 'nwjs:install', 'nwjs:modclean'], function(cb) {

	var nw = new NwBuilder({
		files: './dist/**/**',
		platforms: ['osx64', 'win64'],
		//flavor: 'normal',
		flavor: 'sdk',
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

gulp.task('copy', ['copy:modules', 'copy:html', 'copy:css', 'copy:library', /*'copy:meyda',*/ 'copy:fonts', 'copy:license']);

gulp.task('build', ['clean', 'ejs', 'webpack', 'copy', 'symlink']);

gulp.task('build-nwjs', ['clean', 'ejs:nwjs', 'webpack', 'copy', 'nwjs']);

gulp.task('watch', ['build', 'connect', 'set-watcher', 'media-manager']);

gulp.task('watch-only', ['build', 'connect', 'set-watcher']);