var gulp = require('gulp');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var HTMLMinifier = require("html-minifier").minify;
var through = require("through2");

const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 20',
  'Firefox >= 14',
  'Explorer >= 8',
  'iOS >= 6',
  'Opera >= 12',
  'Safari >= 6'
];

gulp.task('clean', function(){
  del.sync(['build/*'], {
    dot: true
  })
})

gulp.task('bundle', function() {
  return gulp
    .src('./src/**')
    .pipe(gulp.dest('./build'))
})
gulp.task('html-press', ['bundle'], function() {
  return gulp
    .src('./build/views/*.html')
    .pipe(through.obj(function(file, encode, cb) {
        var contents = file.contents.toString(encode);
        
        var minified = HTMLMinifier(contents, {
          minifyCSS: true,
          minifyJS: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        });

        file.contents = new Buffer(minified, encode);
        cb(null, file, encode);
      }))
    .pipe(gulp.dest('./build/views'))
})

gulp.task('prefix-css', ['bundle'], function() {
  return gulp
    .src('./build/css/*.css')
    .pipe(autoprefixer({
      browsers: AUTOPREFIXER_BROWSERS
    }))
    .pipe(gulp.dest('./build/css/'))
})

gulp.task('uglify', ['bundle'], function() {
  return gulp
    .src('./build/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./build/js/'))
})

gulp.task('build', ['clean', 'bundle', 'html-press', 'prefix-css', 'uglify'])

gulp.task('dev', ['clean', 'bundle', 'html-press', 'prefix-css'])

gulp.task('watch', ['clean'], function() {
  return gulp
    .src('./src/**')
    .pipe(gulp.dest('./build'))
})