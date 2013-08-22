"use strict";

var request = require('request');

module.exports = function translationTask(grunt){
  var util = require('./helpers.js')(grunt);

  return {
    /**
     * Exposing the request Object.
     * Mainly to mock it for tests.
     */
    _request: request,
    /**
     * Retrieves a remote spreadsheet, parses and returns its content.
     *
     * @throws Error if the remote file is not reachable/found/whatever
     * @param {Function} done Callback executed when the fetching/parsing is successfully done
     */
    downloadSpreadsheet: function downloadFromSpreadsheet(done){
      var url = grunt.config.get(grunt.task.current.name + '.src');

      this._request.get(url, function (error, response, body) {
        if (!error && response.statusCode === 200){
          var array = util.CSVToArray(body);
          var propertyNames = array[0].slice(2);
          done(null, array, propertyNames);
        } else {
          throw Error('Remote translation file not found (tried with: '+url+')');
        }
      })
    },
    locateLanguage: function locateLanguage(languages, propertyNames, done){
      var language = grunt.config.get('language');
      var translations;
      var found = languages.some(function(currentLanguage){
        if(currentLanguage[1] === language){
          translations = currentLanguage;
          return true;
        }
      });

      if (!found) {
        throw Error(language + ' not found.');
      } else {
        translations = translations.map(function(translation){
          return translation.trim();
        });
        propertyNames = propertyNames.map(function(property){
          return property.trim();
        });
        done(null, translations, propertyNames);
      }
    },
    createJSFile: function createJSFile(translations, propertyNames, done){
      var catalogue = {};
      // skip first 2 to stop language.code and language.name being saved into the file
      translations.slice(2).forEach(function(translation, i){
        if (translation !== "NOT_REQUIRED"){
          if (translation === ""){
            grunt.log.error(propertyNames[i] + " has no translation.");
          }
          catalogue[ propertyNames[i] ] = translation;
        } else {
          catalogue[ propertyNames[i] ] = "";
        }
      });

      var languageString = 'define(';
      languageString += JSON.stringify(catalogue,null,4);
      languageString += ");";
      var languageCode = translations[0] || '';
      grunt.file.write(grunt.config.get(grunt.task.current.name + '.dest') + languageCode + '.js', languageString);
      done();
    },
    createINIFile: function createINIFile(translations, propertyNames, done){
      var languageString = '[translations]';
      var template;
      var previousTemplate;
      function convertToNBSP(translation) {
        return translation.split(" ").join("&nbsp;");
      }

      // skip first 2 to stop language.code and language.name being saved into the file
      translations.slice(2).forEach(function(translation, i){
        if (translation !== "NOT_REQUIRED"){
          if (translation !== ""){
            if (propertyNames[i] === "share.aboutSharing"){
              translation = convertToNBSP(translation);
            }
            template = propertyNames[i].substr(0,propertyNames[i].indexOf('.'));
            if (template !== previousTemplate){
              languageString += '\n';
            }
            languageString += propertyNames[i] + ' = "' + translation + '"\n';
            previousTemplate = template;
          } else {
            grunt.log.error(propertyNames[i] + " has no translation.");
          }
        }
      });

      var languageCode = translations[0] || "";
      grunt.file.write(grunt.config.get(grunt.task.current.name + '.dest') + languageCode + '.ini', languageString);
      done();
    }
  };
};