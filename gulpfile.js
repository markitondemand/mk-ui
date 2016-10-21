
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	paths = {
		'style': {
			all: './src/scss/*.scss',
			output: './src/css/'
		}
	};

gulp.task('watch:sass', function () {
	gulp.watch(paths.style.all, ['sass']);
});

gulp.task('sass', function(){
	gulp.src(paths.style.all)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.style.output));
});

gulp.task('watch', ['watch:sass']);