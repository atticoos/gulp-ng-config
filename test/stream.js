'use strict';

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
      fs = require('fs'),
      Readable = require('stream').Readable;

  before(function () {
    chai.use(spies);
    expect = chai.expect;
    should = chai.should;
  });

  describe('error handling', function () {
    it('should throw an error if a module name is missing', function () {
      expect(function () {
        plugin();
      }).to.throw(Error);
    });

    it ('should only accept files in JSON format', function () {
      var mockFiles = [
        new File({
          path: 'mock/path.json',
          contents: new Readable({objectMode: true}).wrap(es.readArray(['one', 'two']))
        }),
        new File({
          path: 'mock/path.json',
          contents: new Buffer('a string')
        }),
        new File({
          path: 'mock/path.json',
          contents: new Buffer(123)
        })
      ];
      mockFiles.forEach(function (file) {
        var stream = plugin('outputConfigurationName');
        stream.on('error', function (error) {
          expect(error.message).to.be.eql('invalid JSON file provided');
        });
        expect(function () {
          stream.write(file);
        }).not.to.throw();
      });
    });

    it('should emit an error on malformed JSON', function () {
      var file,
          stream;
      stream = plugin('asdf');
      stream.on('error', function (error) {
        expect(error.message).to.be.equal('invalid JSON file provided');
      });
      file = new File({
        path: 'mock/path.json',
        contents: new Buffer('{a:b}')
      });
      expect(function () {
        stream.write(file);
      }).to.not.throw();
    });
    it ('should emit an error when supplying an invalid parser', function () {
      var file,
          stream;

      file = new File({
        path: 'mock/path.json',
        contents: new Buffer('{"foo": "bar"}')
      });

      stream = plugin('asdf', {
        parser: 'invalidParser'
      });
      stream.on('error', function (error) {
        expect(error.message).to.be.eql('invalidParser' + ' is not supported as a valid parser');
      });
      expect(function () {
        stream.write(file);
      }).not.to.throw();
    });
    it ('should emit an error if the configuration exposes an invalid JSON object', function (done) {
      var file,
          stream;

      file = new File({
        path: 'mock/path.json',
        contents: new Buffer('1')
      });

      stream = plugin('asdf')
        .on('error', function (error) {
          expect(error.message).to.equal('configuration file contains invalid JSON');
          done();
        });

      expect(function () {
        stream.write(file);
      }).not.to.throw();
    });
  });

  describe('config generation', function () {
    describe('json', function () {
      it('should generate the angular template with scalar properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_1.json'))
            .pipe(plugin('gulp-ng-config'))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate the angular template with object properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config'))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
    });
    describe('yml', function () {
      it('should generate the angular template with scalar properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_1.yml'))
            .pipe(plugin('gulp-ng-config', {
              parser: 'yml'
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate the angular template with object properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.yml'))
            .pipe(plugin('gulp-ng-config', {
              parser: 'yml'
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate the angular template with object properties with no parser', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.yml'))
            .pipe(plugin('gulp-ng-config'))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should emit an error if an invalid yml file is provided', function (done) {
        var file,
            stream;

        file = new File({
          path: 'mock/path.yml',
          contents: new Buffer('[}]')
        });

        stream = plugin('name')
          .on('error', function (error) {
            expect(error.message).to.equal('invaild YML file provided');
            done();
          });
        expect(function () {
          stream.write(file);
        }).not.to.throw();
      });
    });
    describe('yaml', function () {
      it('should generate the angular template with object properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.yaml'))
            .pipe(plugin('gulp-ng-config', {
              parser: 'yaml'
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should emit an error if an invalid yaml file is provided', function (done) {
        var file,
            stream;

        file = new File({
          path: 'mock/path.yaml',
          contents: new Buffer('[}]')
        });

        stream = plugin('name')
          .on('error', function (error) {
            expect(error.message).to.equal('invaild YML file provided');
            done();
          });
        expect(function () {
          stream.write(file);
        }).not.to.throw();
      });
    });
  });
  describe('plugin options', function () {
    it('should generate the angular template with overridable properties', function (done) {
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
    it('should generate the angular template with overridable and mergable properties', function (done) {
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
    it('should generate the angular template without declaring a new module', function (done) {
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
    it('should merge environment keys with constant keys', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_11.js')),
          streamA = gulp.src(path.normalize(__dirname + '/mocks/input_3.json'));

      streamA
          .pipe(plugin('gulp-ng-config', {
            environment: 'environmentA',
            constants: {
              constant: 'value'
            }
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
    });
    describe('wrap', function () {
      it('should generate the angular template with an IFFE if options.wrap', function (done) {
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
      it('should generate the angular template with a custom wrap function if options.wrap is a string',
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
      it ('should generate an ES6 template when ES6 is specified for wrap', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_17.js')));
        gulp.src(path.normalize(path.join(__dirname, 'mocks/input_2.json')))
          .pipe(plugin('gulp-ng-config', {
            wrap: 'ES6'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it ('should generate an ES6 template when ES2015 is specified for wrap', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_17.js')));
        gulp.src(path.normalize(path.join(__dirname, 'mocks/input_2.json')))
          .pipe(plugin('gulp-ng-config', {
            wrap: 'ES2015'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
    });
    describe('environment', function () {
      it ('should select an embedded json object if an environment key is supplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_8.js')));
        gulp.src(path.normalize(path.join(__dirname, 'mocks/input_3.json')))
          .pipe(plugin('gulp-ng-config', {
            environment: 'environmentA'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it ('should select an embedded json object if a namespaced environment key is supplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_15.js')));
        gulp.src(path.normalize(path.join(__dirname, 'mocks/input_4.json')))
          .pipe(plugin('gulp-ng-config', {
            environment: 'env.environmentA'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it('should emit an error if an environment key is supplied and the key does not exist', function (done) {
        gulp.src(path.normalize(__dirname + '/mocks/input_3.json')).pipe(plugin('gulp-ng-config', {
          environment: 'nonExistingEnvironment'
        })).on('error', function (error) {
          expect(error.message).to.be.eql('invalid \'environment\' value');
          done();
        });
      });
      it('should select specified embedded json objects if an array of environment keys is suplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_18.js')));
        gulp.src(path.normalize(__dirname + '/mocks/input_3.json')).pipe(plugin('gulp-ng-config', {
          environment: ['environmentA', 'environmentB']
        })).pipe(through.obj(function (file) {
          expect(file.contents.toString()).to.equal(expectedOutput.toString());
          done();
        }));
      });
      it('should only include constans keys if an empty array is suplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_19.js')));
        gulp.src(path.normalize(__dirname + '/mocks/input_3.json')).pipe(plugin('gulp-ng-config', {
          environment: [],
          constants: {
            constant: 'value'
          }
        })).pipe(through.obj(function (file) {
          expect(file.contents.toString()).to.equal(expectedOutput.toString());
          done();
        }));
      });
      it('should select specified embedded json objects from array with namespaced environment keys', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_20.js')));
        gulp.src(path.normalize(__dirname + '/mocks/input_3.json')).pipe(plugin('gulp-ng-config', {
          environment: ['environmentA', 'environmentB.four']
        })).pipe(through.obj(function (file) {
          expect(file.contents.toString()).to.equal(expectedOutput.toString());
          done();
        }));
      });
    });
    describe('type', function () {
      it('should generate a `value` module if `type` is specified with `value`', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_16.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
          .pipe(plugin('gulp-ng-config', {
            type: 'value'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it ('should generate a `constant` module if `type` is specified with a `constant`', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_15.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
          .pipe(plugin('gulp-ng-config', {
            type: 'constant'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it ('should generate a `constant` module by default if `moduleTye` is not supplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_15.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
          .pipe(plugin('gulp-ng-config', {
            type: undefined
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it ('should emit an error if an invalid `type` is supplied', function (done) {
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
          .pipe(plugin('gulp-ng-config', {
            type: 'invalid'
          }))
          .on('error', function (error) {
            expect(error.message).to.be.eql('invalid \'type\' value');
            done();
          });
      });
    });
    describe('pretty', function () {
      it('should generate pretty-looked content with default spaces', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_12.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              pretty: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate common-looked content with pretty set to false', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_14.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              pretty: false
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate pretty-looked content with number of spaces', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_13.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              pretty: 4
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate an error if an invalid value is provided', function (done) {
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
          .pipe(plugin('gulp-ng-config', {
            pretty: 'foobar'
          }))
          .on('error', function (error) {
            expect(error.message).to.equal('invalid \'pretty\' value. Should be boolean value or an integer number');
            done();
          });
      });
      it('should generate an error if an inifite value is provided', function (done) {
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
          .pipe(plugin('gulp-ng-config', {
            pretty: Infinity
          }))
          .on('error', function (error) {
            expect(error.message).to.equal('invalid \'pretty\' value. Should be boolean value or an integer number');
            done();
          });
      });
    });
    describe('keys', function () {
      it ('should select some keys if a keys option is supplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_22.js')));
        gulp.src(path.normalize(path.join(__dirname, 'mocks/input_5.json')))
          .pipe(plugin('gulp-ng-config', {
            keys: ['version', 'wanted']
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it('should emit an error if keys option is not an array', function (done) {
        gulp.src(path.normalize(__dirname + '/mocks/input_5.json')).pipe(plugin('gulp-ng-config', {
          keys: 'non-array value'
        })).on('error', function (error) {
          expect(error.message).to.be.eql('invalid \'keys\' value');
          done();
        });
      });
    });
    describe('templateFilePath', function () {
      it('should load a custom template file', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_21.js')));
        gulp.src(path.normalize(path.join(__dirname, '/mocks/input_2.json')))
          .pipe(plugin('gulp-ng-config', {
            templateFilePath: path.normalize(path.join(__dirname, 'mocks/customTemplate.html'))
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      it('should generate an error if the template file does not exist', function (done) {
        gulp.src(path.normalize(path.join(__dirname, '/mocks/input_2.json')))
          .pipe(plugin('gulp-ng-config', {
            templateFilePath: 'non/existant/path.js'
          }))
          .on('error', function (error) {
            expect(error.message).to.equal('invalid templateFilePath option, file not found');
            done();
          });
      });
      it('should use the default template path if a falsy value is provided', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_2.js')));
        gulp.src(path.normalize(path.join(__dirname, '/mocks/input_2.json')))
          .pipe(plugin('gulp-ng-config', {
            templateFilePath: null
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
    });
  });
});
