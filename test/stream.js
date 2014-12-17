describe('gulp-ng-config', function () {
  var expect,
      should,
      plugin = require('../gulp-ng-config'),
      gulp = require('gulp'),
      path = require('path'),
      chai = require('chai'),
      spies = require('chai-spies'),
      File = require('vinyl'),
      es = require('event-stream'),
      through = require('through2'),
      fs = require('fs');

  before(function () {
    chai.use(spies);
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
      var file, stream, spy;
      stream = plugin('asdf');
      spy = chai.spy();
      stream.on('error', spy);

      file = new File({
        path: 'mock/path.json',
        contents: es.readArray(['one', 'two'])
      });
      expect(function () {
        stream.write(file);
      }).to.not.throw(Error);
      expect(spy).to.have.been.called.twice();

      stream = plugin('asdf');
      spy = chai.spy();
      stream.on('error', spy);
      file = new File ({
        path: 'mock/path.json',
        contents: new Buffer('a string')
      });
      expect(function () {
        stream.write(file);
      }).to.not.throw(Error);
      expect(spy).to.have.been.called.twice();

      stream = plugin('asdf');
      spy = chai.spy();
      stream.on('error', spy);
      file = new File({
        path: 'mock/path.json',
        contents: new Buffer(123)
      });
      expect(function () {
        stream.write(file);
      }).to.not.throw(Error);
      expect(spy).to.have.been.called.twice();
    });

    it ('should emit an error on malformed JSON', function () {
      var file, stream, spy;
      stream = plugin('asdf');
      spy = chai.spy();
      stream.on('error', spy);

      file = new File({
        path: 'mock/path.json',
        contents: new Buffer('{a:b}')
      });
      expect(function () {
        stream.write(file);
      }).to.not.throw();
      expect(spy).to.have.been.called();
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
  });
  describe('plugin options', function () {
    it ('should generate the angular template with overridable properties', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_3.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config', {
        constants: {
          one: {
            two: 'four'
          }
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
        constants: {
          one: {
            three: 'four'
          }
        }
      }))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
    it ('should generate the angular template without declaring a new module', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_5.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config', {
        createModule: false
      }))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
    it ('should generate the angular template with an IFFE if options.wrap', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_6.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config', {
        wrap: true
      }))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
    it ('should generate the angular template with a custom wrap function if options.wrap is a string',
    function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_7.js'));
      gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
      .pipe(plugin('gulp-ng-config', {
        wrap: 'define([\'angular\', function () {\n return <%= module %>}]);\n'
      }))
      .pipe(through.obj(function (file) {
        expect(file.contents.toString()).to.equal(expectedOutput.toString());
        done();
      }));
    });
  });
});
