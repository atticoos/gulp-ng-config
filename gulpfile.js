var gulp = require('gulp'),
    mocha = require('gulp-mocha');

gulp.task('test', function () {
  gulp.src('test/stream.js')
  .pipe(mocha({reporter: 'spec'}));
})
