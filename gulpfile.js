
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	less = require('gulp-less'),
	paths = {
		'style': {
			sass: './src/scss/*.scss',
			less: './src/less/*.less',
			output: './src/css/'
		}
	};

gulp.task('watch:sass', function () {
	gulp.watch(paths.style.sass, ['sass']);
});

gulp.task('sass', function(){
	gulp.src(paths.style.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.style.output));
});

// for testing purposes only
// our compiled css comes from sass and we provide the raw sass in our node module 
// but for projcts running on less, we want to provide you with working less files as well

gulp.task('less', function () {
  gulp.src(paths.style.less)
    .pipe(less())
    .pipe(gulp.dest('./src/css'));
});

gulp.task('watch', ['watch:sass']);