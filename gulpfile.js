var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var rename = require("gulp-rename");

var path = {
	src : {
		scss: 'src/scss/*.scss',
		js: 'src/js/*.js'
	},
	dest: {
		css: 'dist/css',
		js: 'dist/js'
	}
}

gulp.task('sass', function(){
	gulp.src(path.src.scss)
		.pipe(sass().on('error', function(){
			notify({
	      		message: "Error Comiling CSS",
	    	});
	    	sass.logError();
		}))
		.pipe(gulp.dest(path.dest.css))
		.pipe(notify({
	      message: "Generated <%= file.relative %>",
	    }))
});

gulp.task('minify-js', function(){
	gulp.src(path.src.js)
		.pipe(uglify())
		.pipe(rename({'suffix': '.min'}))
		.pipe(gulp.dest(path.dest.js))
		.pipe(notify({
	      message: "Generated <%= file.relative %>",
	    }));
});

gulp.task('minify', ['sass', 'minify-js']);

gulp.task('watch', function(){
	gulp.watch(path.src.scss, ['sass']);
	gulp.watch(path.src.js, ['minify-js']);
})



