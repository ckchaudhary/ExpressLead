// Require the npm modules we need
var gulp = require("gulp"),
    rename = require("gulp-rename"),
	concat = require('gulp-concat'),
    cleanCSS = require("gulp-clean-css"),
    terser = require("gulp-terser");

function minifyCSS() {
  return gulp.src([
		"./public/assets/css/_src/animate.min.css",
		"./public/assets/css/_src/slick-theme.css",
		"./public/assets/css/_src/slick.css",
		"./public/assets/select2/dist/css/select2.min.css",
		"./public/assets/css/_src/style.css",
	])
	.pipe(concat('dist.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/assets/css"));
}

function minifyJSLibs() {
  return gulp.src([
		"./public/assets/js/_src/jquery.min.js",
		"./public/assets/js/_src/slick.min.js",
		"./public/assets/select2/dist/js/select2.min.js",
	])
    .pipe(concat("dist.min.js"))
    .pipe(gulp.dest("./public/assets/js"));
}

function minifyJS() {
  return gulp.src([
		"./public/assets/js/_src/custom.js"
	])
    .pipe(rename("custom.js"))
    .pipe(terser())
    .pipe(gulp.dest("./public/assets/js"));
}

exports.default = gulp.parallel(minifyCSS, minifyJSLibs, minifyJS);