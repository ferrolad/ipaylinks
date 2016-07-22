var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');   
var useref = require('gulp-useref');  
var gulpif = require('gulp-if'); 
// var revReplace = require('gulp-rev-replace');                             //- 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');               //- 路径替换
var autoprefixer = require('gulp-autoprefixer');

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
  del.sync(['./build'], {
    dot: true
  })
})

gulp.task('html', function () {
  function jsProd(file) {
    return /.*\.js$/.test(file.path)
  }
  function cssProd(file) {
    return /.*\.css$/.test(file.path)
  }

  return gulp.src('./src/**/*.html')
    .pipe(useref())
    // .pipe(gulpif(jsProd, uglify()))
    // .pipe(gulpif(cssProd, minifyCss()))
    // .pipe(rev())
    // .pipe(revReplace())
    .pipe(gulp.dest('./build'));
});

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function(){
    return gulp.src('./src/fonts/*')
        .pipe(rev())
        .pipe(gulp.dest('./build/fonts'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./build/rev/fonts'));
});

gulp.task('revImg', function(){
    return gulp.src('./src/images/*')
        .pipe(rev())
        .pipe(gulp.dest('./build/images'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./build/rev/images'));
});

//CSS里更新引入文件版本号
gulp.task('revCss', function () {
    return gulp.src(['./build/rev/**/*.json', './build/css/combined.css', './build/css/combined-fa.css'])
        .pipe(rev())
        .pipe(revCollector()) 
        .pipe(autoprefixer({
          browsers: AUTOPREFIXER_BROWSERS
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest('./build/css'))
        .pipe(rev.manifest()) 
        .pipe(gulp.dest('./build/rev/css'));
});

gulp.task('revJs', function () {
    return gulp.src('./build/js/combined.js')
        .pipe(rev())
        .pipe(uglify())
        .pipe(gulp.dest('./build/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./build/rev/js'));
});

gulp.task('revHtml', function () {
    return gulp.src(['./build/rev/**/*.json', './build/**/*.html'])
        .pipe(revCollector()) 
        .pipe(gulp.dest('./build'));
});


gulp.task('delRevCss', function(){
    del(['./build/rev/**/*.json', './build/rev', './css', './js']);    
})

gulp.task('build', ['clean'], function(done) {
    runSequence(
         ['revFont', 'revImg'],
         ['html'],
         ['revCss'],
         ['revJs'],
         ['revHtml'],
         ['delRevCss'],
    done);
})

gulp.task('dev', function(done) {
    runSequence(
         ['revFont', 'revImg'],
         ['html'],
         ['revCss'],
         ['revJs'],
         ['revHtml'],
         ['delRevCss'],
    done);
})

gulp.task('watch', ['clean'], function() {
    runSequence('dev', function () {
        gulp.watch(['./src/*.html', './src/en/*.html'], ['html', 'revHtml']);
        gulp.watch('./src/js/*.js', ['revJs', 'revHtml']);
        gulp.watch('./src/fonts/*', ['revFont', 'revCss', 'revHtml']);
        gulp.watch('./src/css/*', ['html','revCss', 'revHtml']);
    });
})

gulp.task('default', ['clean', 'dev']);