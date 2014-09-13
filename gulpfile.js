var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

gulp.task('lint', function () {
  gulp.src(['gulp-ng-config.js', 'test/stream.js'])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('style', function () {
  gulp.src(['gulp-ng-config.js', 'test/stream.js'])
  .pipe(jscs());
});

gulp.task('unittest', function () {
  gulp.src('test/stream.js')
  .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test', ['lint', 'style', 'unittest']);
gulp.task('default', ['test']);
