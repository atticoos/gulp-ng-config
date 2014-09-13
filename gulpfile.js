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

gulp.task('test', function () {
  gulp.src('test/stream.js')
  .pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['lint', 'style', 'test']);
