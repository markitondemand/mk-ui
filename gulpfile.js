
var gulp   = require('gulp'),
	sass   = require('gulp-sass'),
	less   = require('gulp-less'),
	mini   = require('gulp-minify'),
	concat = require('gulp-concat'),
	paths  = {
		'style': {
			sass: './dist/scss/*.scss',
			less: './dist/less/*.less',
			output: './dist/css'
		},
		'scripts': {
			src: './src/js/*.js',
			output: './dist/js',
			original: '.js',
			minified: '.min.js'
		},
		'dom': {
			files: [
				'./src/js/core/dom/intro.js',
				'./src/js/core/dom/data.js',
				'./src/js/core/dom/remove.js',
				'./src/js/core/dom/ajax.js',
				'./src/js/core/dom/events.js',
				'./src/js/core/dom/core.js',
				'./src/js/core/dom/outro.js'
			]
		},
		'core': {
			files: [
				'./src/js/core/intro.js',
				'./src/js/core/variables.js',
				'./src/js/core/type.js',
				'./src/js/core/iterators.js',
				'./src/js/core/property.js',
				'./src/js/core/templates.js',
				'./src/js/core/eventemitter.js',
				'./src/js/core/transitions.js',
				'./src/js/core/device.js',
				'./src/js/core/dom.js',
				'./src/js/core/keycodes.js',
				'./src/js/core/statics.js',
				'./src/js/core/prototype.js',
				'./src/js/core/outro.js'
			]
		}
	};

gulp.task('build-core', function () {

	gulp.src(paths.core.files)
		.pipe(concat('core.js'))
		.pipe(gulp.dest('./src/js'))
});

gulp.task('build-dom', function () {

	gulp.src(paths.dom.files)
		.pipe(concat('dom.js'))
		.pipe(gulp.dest('./src/js/core'))
});

gulp.task('minify', function () {

	gulp.src(paths.scripts.src)
		.pipe(mini({
			ext: {
				src: paths.scripts.original,
				min: paths.scripts.minified
			},
			mangle: true
		}))
		.pipe(gulp.dest(paths.scripts.output));
});

gulp.task('sass', function () {

	gulp.src(paths.style.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.style.output));
});

//
// for testing purposes only
// our compiled css comes from sass and we provide the raw sass in our node module
// but for projcts running on less, we want to provide you with working less files as well
// --------------------------------------

gulp.task('less', function () {

  gulp.src(paths.style.less)
    .pipe(less())
    .pipe(gulp.dest(paths.style.output));
});
