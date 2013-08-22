module.exports = function (grunt) {
  grunt.initConfig({

    // Store your Package file so you can reference its specific data whenever necessary
    pkg: grunt.file.readJSON('package.json'),

    "mochaTest": {
      "grunt-tasks": {
        src: "test/grunt-*.js"
      }
    },

    watch: {
      "unit-tests": {
        files: [
          '<%= mochaTest["grunt-tasks"].src %>',
          'src/grunt/**/*.js'
        ],
        tasks: ['mochaTest']
      }
    },

    generateJS: {
      dest:"webapp/static/js/module/translations/",
      src: "https://gist.github.com/oncletom/d409e6d859e6b22bd0f7/raw/fb18ac4aebaaf107356890ee819feabe3afb1226/translations.csv"
    },

    generateINI: {
      dest:"webapp/BBC/News/Translation/",
      src: "https://gist.github.com/oncletom/d409e6d859e6b22bd0f7/raw/fb18ac4aebaaf107356890ee819feabe3afb1226/translations.csv"
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['mochaTest']);

  require('./src/custom-tasks.js')(grunt);
};
