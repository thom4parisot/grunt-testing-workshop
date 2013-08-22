var path = require('path');

var blacklistedServices = ['journalism'];

module.exports = function (grunt) {
  "use strict";

  /**
   * Returns true if a service ID is not blacklisted
   *
   * @param {String} element
   * @returns {boolean}
   */
  function isFolderNotBlacklisted(element) {
    return blacklistedServices.indexOf(element) === -1;
  }

  return {
    /**
     * Returns the list of available services
     *
     * @returns {Array}
     */
    get services(){
      return grunt.file.expand('tabloid/webapp/static/sass/services/*').map(path.basename).filter(isFolderNotBlacklisted)
    },
    /**
     * Indicates if a service exists or not.
     * Includes blacklistedServices check.
     *
     * @param {String} service
     * @returns {boolean}
     */
    serviceExists: function (service) {
      return this.services.indexOf(service) !== -1;
    },
    /**
     * Parses a supposed CSV string and returns it as an array of rows
     * Each row is indeed an array of cell value.
     *
     * @param {String} strData
     * @param {String=} strDelimiter
     * @returns {Array.<Array>}
     */
    CSVToArray: function (strData, strDelimiter) {
      strData = strData.trim();
      if (strData === ""){
        return [];
      }
      strDelimiter = (strDelimiter || ",");
      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
        ( // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
          ),
        "gi"
      );
      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [
        []
      ];
      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;
      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length &&
          (strMatchedDelimiter != strDelimiter)
          ) {
          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"),
            "\""
          );

        } else {
          // We found a non-quoted value.
          var strMatchedValue = arrMatches[3];

        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
      }
      return (arrData);
    },
    /**
     * Returns a capitalized string.
     * bla bla -> Bla bla
     * I Love Cats And Wine (And CI) -> I love cats and wine (and ci)
     *
     * @param {String} string
     * @returns {string}
     */
    uppercaseFirst: function normaliseInput(string)  {
      var newString;

      newString = string.trim();
      newString = newString.toLowerCase();
      newString = (newString[0] || '').toUpperCase() + newString.slice(1);

      return newString;
    }
  }
};