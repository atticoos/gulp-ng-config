var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    istanbul = require('gulp-istanbul');

gulp.task('lint', function () {
  gulp.src(['gulp-ng-config.js', 'test/stream.js'])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('style', function () {
  gulp.src(['gulp-ng-config.js', 'test/stream.js'])
  .pipe(jscs());
});

gulp.task('pre-test', function () {
  return gulp.src('gulp-ng-config.js')
  .pipe(istanbul())
  .pipe(istanbul.hookRequire());
})

gulp.task('unittest', ['pre-test'], function () {
  gulp.src('test/stream.js')
  .pipe(mocha({reporter: 'spec'}))
  .pipe(istanbul.writeReports());
});

gulp.task('test', ['lint', 'style', 'unittest']);
gulp.task('default', ['test']);
