var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    istanbul = require('gulp-istanbul'),
    coveralls = require('gulp-coveralls');

gulp.task('lint', function () {
  return gulp.src(['gulp-ng-config.js', 'test/stream.js'])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'))
});

gulp.task('style', function () {
  return gulp.src(['gulp-ng-config.js', 'test/stream.js'])
  .pipe(jscs())
  .pipe(jscs.reporter('console'))
  .pipe(jscs.reporter('fail'));
});

gulp.task('pre-test', function () {
  return gulp.src('gulp-ng-config.js')
  .pipe(istanbul())
  .pipe(istanbul.hookRequire());
});

gulp.task('unittest', ['pre-test'], function () {
  return gulp.src('test/stream.js')
  .pipe(mocha({reporter: 'spec'}))
  .pipe(istanbul.writeReports());
});

gulp.task('coveralls', function () {
  return gulp.src('coverage/lcov.info')
  .pipe(coveralls());
});

gulp.task('test', ['lint', 'style', 'unittest']);
gulp.task('default', ['test']);
