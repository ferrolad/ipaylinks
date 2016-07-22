var gulp = require('gulp');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var del = require('del');
var rev = require('gulp-rev');                                  //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');               //- 路径替换
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

gulp.task('html-press', ['bundle', 'rev-all'], function() {
  return gulp
    .src('./build/*.html')
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
    .pipe(gulp.dest('./build/'))
})

gulp.task('en-html-press', ['bundle', 'rev-all'], function() {
  return gulp
    .src('./build/en/*.html')
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
    .pipe(gulp.dest('./build/en/'))
})

gulp.task('html-press-all', ['html-press', 'en-html-press'], function() {
  return gulp
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

gulp.task('md5-css', ['bundle', 'prefix-css'], function() {                             //- 创建一个名为 concat 的 task
  return gulp.src('./build/css/ipaylinks.css')                     //- 压缩处理成一行
      .pipe(rev())                                            //- 文件名加MD5后缀
      .pipe(gulp.dest('./build/css/'))                        //- 输出文件本地
      .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
      .pipe(gulp.dest('./build/rev/'));                       //- 将 rev-manifest.json 保存到 rev 目录内
})

gulp.task('rev', ['md5-css'], function() {
  return  gulp.src(['./build/rev/*.json', './build/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
      .pipe(revCollector())                  //- 执行文件内css名的替换
      .pipe(gulp.dest('./build/'));                 //- 替换后的文件输出的目录
})

gulp.task('rev-en', ['md5-css'], function() {
  return  gulp.src(['./build/rev/*.json', './build/en/*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
      .pipe(revCollector())                  //- 执行文件内css名的替换
      .pipe(gulp.dest('./build/en/'));                 //- 替换后的文件输出的目录
})

gulp.task('rev-all', ['rev', 'rev-en'],function(){
  return gulp
})

gulp.task('build', ['clean', 'bundle', 'rev-all', 'html-press-all', 'prefix-css', 'uglify'])

gulp.task('dev', ['clean', 'bundle', 'rev-all', 'html-press-all', 'prefix-css'])

gulp.task('watch', ['clean'], function() {
  return gulp
    .src('./src/**')
    .pipe(gulp.dest('./build'))
})