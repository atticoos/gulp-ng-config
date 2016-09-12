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
      fs = require('fs');

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
          contents: es.readArray(['one', 'two'])
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1d.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_1.json'))
            .pipe(plugin('gulp-ng-config'))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate the angular template with object properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2d.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config'))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      describe('single-quotes', function () {
        it('should generate the angular template with scalar properties', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_1.json'))
                .pipe(plugin('gulp-ng-config', {
                  singleQuotes: true
                }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate the angular template with object properties', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
                .pipe(plugin('gulp-ng-config', {
                  singleQuotes: true
                }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
      });
    });
    describe('yml', function () {
      it('should generate the angular template with scalar properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2d.js'));
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
      describe('single-quotes', function () {
        it('should generate the angular template with scalar properties', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_1s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_1.yml'))
              .pipe(plugin('gulp-ng-config', {
                parser: 'yml',
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate the angular template with object properties', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.yml'))
              .pipe(plugin('gulp-ng-config', {
                parser: 'yml',
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate the angular template with object properties with no parser', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.yml'))
                .pipe(plugin('gulp-ng-config', {
                  singleQuotes: true
                }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
      });
    });
    describe('yaml', function () {
      it('should generate the angular template with object properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2d.js'));
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
      describe('single-quotes', function () {
        it('should generate the angular template with object properties', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_2s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.yaml'))
              .pipe(plugin('gulp-ng-config', {
                parser: 'yaml',
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
      });
    });
  });
  describe('plugin options', function () {
    it('should generate the angular template with overridable properties', function (done) {
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_3d.js'));
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
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_4d.js'));
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
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_5d.js'));
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
      var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_11d.js')),
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
    describe('single-quotes', function () {
      it('should generate the angular template with overridable properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_3s.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              constants: {
                one: {
                  two: 'four'
                }
              },
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate the angular template with overridable and mergable properties', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_4s.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              constants: {
                one: {
                  three: 'four'
                }
              },
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should generate the angular template without declaring a new module', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_5s.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              createModule: false,
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it('should merge environment keys with constant keys', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_11s.js')),
            streamA = gulp.src(path.normalize(__dirname + '/mocks/input_3.json'));

        streamA
            .pipe(plugin('gulp-ng-config', {
              environment: 'environmentA',
              constants: {
                constant: 'value'
              },
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
    });
    describe('wrap', function () {
      it('should generate the angular template with an IFFE if options.wrap', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_6d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_7d.js'));
        gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              wrap: 'define(["angular", function () {\n return <%= module %>}]);\n'
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
      });
      it ('should generate an ES6 template when ES6 is specified for wrap', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_17d.js')));
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
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_17d.js')));
        gulp.src(path.normalize(path.join(__dirname, 'mocks/input_2.json')))
          .pipe(plugin('gulp-ng-config', {
            wrap: 'ES2015'
          }))
          .pipe(through.obj(function (file) {
            expect(file.contents.toString()).to.equal(expectedOutput.toString());
            done();
          }));
      });
      describe('single-quotes', function () {
        it('should generate the angular template with an IFFE if options.wrap', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_6s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
              .pipe(plugin('gulp-ng-config', {
                wrap: true,
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate the angular template with a custom wrap function if options.wrap is a string',
          function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_7s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
              .pipe(plugin('gulp-ng-config', {
                wrap: 'define([\'angular\', function () {\n return <%= module %>}]);\n',
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it ('should generate an ES6 template when ES6 is specified for wrap', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_17s.js')));
          gulp.src(path.normalize(path.join(__dirname, 'mocks/input_2.json')))
            .pipe(plugin('gulp-ng-config', {
              wrap: 'ES6',
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
        it ('should generate an ES6 template when ES2015 is specified for wrap', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_17s.js')));
          gulp.src(path.normalize(path.join(__dirname, 'mocks/input_2.json')))
            .pipe(plugin('gulp-ng-config', {
              wrap: 'ES2015',
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
      });
    });
    describe('environment', function () {
      it ('should select an embedded json object if an environment key is supplied', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_8d.js')));
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
        var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_15d.js')));
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
      describe('single-quotes', function () {
        it ('should select an embedded json object if an environment key is supplied', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_8s.js')));
          gulp.src(path.normalize(path.join(__dirname, 'mocks/input_3.json')))
            .pipe(plugin('gulp-ng-config', {
              environment: 'environmentA',
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
        it ('should select an embedded json object if a namespaced environment key is supplied', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(path.join(__dirname, 'mocks/output_15s.js')));
          gulp.src(path.normalize(path.join(__dirname, 'mocks/input_4.json')))
            .pipe(plugin('gulp-ng-config', {
              environment: 'env.environmentA',
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
      });
    });
    describe('type', function () {
      it('should generate a `value` module if `type` is specified with `value`', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_16d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_15d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_15d.js'));
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
      describe('single-quotes', function () {
        it('should generate a `value` module if `type` is specified with `value`', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_16s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              type: 'value',
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
        it ('should generate a `constant` module if `type` is specified with a `constant`', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_15s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              type: 'constant',
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
        it ('should generate a `constant` module by default if `moduleTye` is not supplied', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_15s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              type: undefined,
              singleQuotes: true
            }))
            .pipe(through.obj(function (file) {
              expect(file.contents.toString()).to.equal(expectedOutput.toString());
              done();
            }));
        });
        it ('should emit an error if an invalid `type` is supplied', function (done) {
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              type: 'invalid',
              singleQuotes: true
            }))
            .on('error', function (error) {
              expect(error.message).to.be.eql('invalid \'type\' value');
              done();
            });
        });
      });
    });
    describe('pretty', function () {
      it('should generate pretty-looked content with default spaces', function (done) {
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_12d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_14d.js'));
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
        var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_13d.js'));
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
      describe('single-quotes', function () {
        it('should generate pretty-looked content with default spaces', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_12s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
              .pipe(plugin('gulp-ng-config', {
                pretty: true,
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate common-looked content with pretty set to false', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_14s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
              .pipe(plugin('gulp-ng-config', {
                pretty: false,
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate pretty-looked content with number of spaces', function (done) {
          var expectedOutput = fs.readFileSync(path.normalize(__dirname + '/mocks/output_13s.js'));
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
              .pipe(plugin('gulp-ng-config', {
                pretty: 4,
                singleQuotes: true
              }))
              .pipe(through.obj(function (file) {
                expect(file.contents.toString()).to.equal(expectedOutput.toString());
                done();
              }));
        });
        it('should generate an error if an invalid value is provided', function (done) {
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              pretty: 'foobar',
              singleQuotes: true
            }))
            .on('error', function (error) {
              expect(error.message).to.equal('invalid \'pretty\' value. Should be boolean value or an integer number');
              done();
            });
        });
        it('should generate an error if an inifite value is provided', function (done) {
          gulp.src(path.normalize(__dirname + '/mocks/input_2.json'))
            .pipe(plugin('gulp-ng-config', {
              pretty: Infinity,
              singleQuotes: true
            }))
            .on('error', function (error) {
              expect(error.message).to.equal('invalid \'pretty\' value. Should be boolean value or an integer number');
              done();
            });
        });
      });
    });
  });
});
