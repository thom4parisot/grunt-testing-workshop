module.exports = function (grunt) {

  var util = require('./grunt/helpers.js')(grunt)

  grunt.registerTask('generateJS', 'Generate JS translation file for chosen language.', function(language) {
    var request = require('request');
    function normaliseInput(string)  {
      var newString = "";

      newString = string.toLowerCase();
      newString = string[0].toUpperCase() + newString.slice(1);

      return newString;
    }

    language = language || 'English';
    language = normaliseInput(language);

    var done = this.async();
    grunt.util.async.waterfall([
      function downloadFromSpreadsheet(done){
        request(grunt.config.get('generateJS.src'), function (error, response, body) {
          if (!error && response.statusCode === 200){
            var array = util.CSVToArray(body);
            var propertyNames = array[0].slice(2);
            length = array.length;
            done(null, array, propertyNames);
          } else {
            grunt.fail.fatal('Remote translation file not found');
          }
        })
      },
      function locateLanguage(languages, propertyNames, done){
        var translations;
        var found = languages.some(function(currentLanguage){
          if(currentLanguage[1] === language){
            translations = currentLanguage;
            return true;
          }
        });

        if (!found) {
          grunt.fail.warn(language + ' not found.');
        }

        done(null, translations, propertyNames)
      },
      function createFile(translations, propertyNames, done){
        var catalogue = {};

        // skip first 2 to stop language.code and language.name being saved into the file
        translations.slice(2).forEach(function(translation, i){
          catalogue[ propertyNames[i] ] = translation;
        });


        var languageString = 'define(';
        languageString += JSON.stringify(catalogue,null,4);
        languageString += ");";
        var languageCode = translations[0];
        grunt.file.write(grunt.config.get('generateJS.dest') + languageCode + '.js', languageString);
        done();
      }

    ], done);
  });

  grunt.registerTask('generateINI', 'Generate INI translaton file for chosen language', function (language) {
    var request = require('request');
    function normaliseInput(string)  {
      var newString = "";

      newString = string.toLowerCase();
      newString = string[0].toUpperCase() + newString.slice(1);

      return newString;
    }

    language = language || 'English';
    language = normaliseInput(language);

    var done = this.async();
    grunt.util.async.waterfall([
      function downloadFromSpreadsheet(done){
        request(grunt.config.get('generateINI.src'), function (error, response, body) {
          if (!error && response.statusCode === 200){
            var array = util.CSVToArray(body);
            var propertyNames = array[0].slice(2);
            length = array.length;
            done(null, array, propertyNames);
          } else {
            grunt.fail.fatal('Remote translation file not found');
          }
        })
      },
      function locateLanguage(languages, propertyNames, done){
        var translations;
        var found = languages.some(function(currentLanguage){
          if(currentLanguage[1] === language){
            translations = currentLanguage;
            return true;
          }
        });

        if (!found) {
          grunt.fail.warn(language + ' not found.');
        }

        done(null, translations, propertyNames)
      },
      function createFile(translations, propertyNames, done){
        var languageString = '[translations]';
        var template;
        var previousTemplate;

        // skip first 2 to stop language.code and language.name being saved into the file
        translations.slice(2).forEach(function(translation, i){
          template = propertyNames[i].substr(0,propertyNames[i].indexOf('.'));
          if (template !== previousTemplate){
            languageString += '\n';
          }
          languageString += propertyNames[i] + ' = "' + translation + '"\n';
          previousTemplate = template;
        });

        var languageCode = translations[0];
        grunt.file.write(grunt.config.get('generateINI.dest') + languageCode + '.ini', languageString);
        done();
      }

    ], done);
  });

  grunt.registerTask('translate', 'Run all generators for chosen language', function(language){
    if (language == undefined) {
      grunt.fail.warn('Please include a language in the task option');
    }
    grunt.task.run(['generateJS:' + language, 'generateINI:' + language]);
  });
};