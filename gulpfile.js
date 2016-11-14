
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	less = require('gulp-less'),
	mini = require('gulp-minify'),
	paths = {
		'style': {
			// sass lives in dist bc developers should take advantags
			sass: './dist/scss/*.scss',
			// less lives in dist bc developers should take advantags
			less: './dist/less/*.less',
			// static css if you have to...
			output: './dist/css'
		},
		'scripts': {
			// grab all src js files
			src: './src/js/*.js',
			output: './dist/js',
			original: '.js',
			minified: '.min.js'
		}
	};

gulp.task('minify', function () {

	gulp.src(paths.scripts.src)
		.pipe(mini({
			ext: {
				src: paths.script.original,
				min: paths.script.minified
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
