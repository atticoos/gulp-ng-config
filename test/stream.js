describe('gulp-ng-config', function () {
  var expect,
      should,
      plugin = require('../gulp-ng-config'),
      gulp = require('gulp'),
      path = require('path'),
      chai = require('chai'),
      File = require('vinyl'),
      es = require('event-stream'),
      through = require('through2'),
      fs = require('fs');

  before(function () {
    expect = chai.expect;
    should = chai.should;
  });

  describe('error handling', function () {
    it ('should throw an error if a module name is missing', function () {
      expect(function () {
        plugin();
      }).to.throw(Error);
    });

    it ('should only accept files in JSON format', function () {
      var file, stream;
      stream = plugin('asdf');

      file = new File({
        path: 'mock/path.json',
        contents: es.readArray(['one', 'two'])
      });
      expect(function () {
        stream.write(file);
      }).to.throw(Error);

      stream = plugin('asdf');
      file = new File ({
        path: 'mock/path.json',
        contents: new Buffer('a string')
      });
      expect(function () {
        stream.write(file);
      }).to.throw(Error);

      stream = plugin('asdf');
      file = new File({
        path: 'mock/path.json',
        contents: new Buffer(123)
      });
      expect(function () {
        stream.write(file);
      }).to.throw(Error);
    });

    it ('should throw an error on malformed JSON', function () {
      var file, stream;
      stream = plugin('asdf');
      file = new File({
        path: 'mock/path.json',
        contents: new Buffer('{a:b}')
      });
      expect(function () {
        stream.write(file);
      }).to.throw(Error);
    });
  });

  describe('config generation', function () {
    it ('should generate the angular template with scalar properties', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_1.json'))
      .pipe(plugin('gulp-ng-config'))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
    it ('should generate the angular template with object properties', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config'))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
    it ('should generate the angular template with overridable properties', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_3.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config', {
        one: {
          two: 'four'
        }
      }))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
    it ('should generate the angular template with overridable and mergable properties', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_4.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config', {
        one: {
          three: 'four'
        }
      }))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
  });
});
