"use strict";

var grunt = require("grunt");
var expect = require("chai").expect;
var sinon = require("sinon");
var steps = require("../src/grunt/translation.js")(grunt);
var util = require('../src/grunt/helpers.js')(grunt);

var validCSVResponse = "Language.code,Language.name,keyA,keyB,keyC\n" +
  "fr,French,Fromage,Baguette,Saucisson\n"+
  "en,English,Cheese,Baguette,Saucisson";


describe("Grunt Task JS Translation Tool", function(){
  var sandbox, gruntConfigGetterStub, requestStub;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();

    requestStub = sandbox.stub(steps._request, "get");
    gruntConfigGetterStub = sandbox.stub(grunt.config, "get", function(){
      return "dummy config value";
    });
  });

  afterEach(function(){
    sandbox.restore();
  });

  it("should contain these helpers", function(){
    expect(steps).to.have.property("downloadSpreadsheet").to.be.a('function');
    expect(steps).to.have.property("locateLanguage").to.be.a('function');
  });

  it("should return translations for the proper language name", function(done){
    requestStub.yields(null, {statusCode: 200}, validCSVResponse);

    steps.downloadSpreadsheet(function(error, results, properties){
      expect(error).to.be.null;
      expect(results).to.be.an('array').to.have.length.of(3);
      expect(results[0]).to.be.an('array').to.have.length.of(5);
      expect(properties).to.be.an('array').to.have.length.of(3);

      done();
    });
  });

  it("should return empty data if the parsing went bad", function (done){
    requestStub.yields(null, {statusCode: 200}, "You should not put that much milk in your body (response)!");

    steps.downloadSpreadsheet(function(error, results, properties){
      expect(error).to.be.null;
      expect(results).to.be.an('array').to.have.length.of(1);   //array containing an empty array
      expect(properties).to.be.an('array').to.have.length.of(0);

      done();
    });
  });

  it("should throw an error if we can't retrieve the remote data", function (){
    requestStub.yields(null, {statusCode: 500});

    expect(steps.downloadSpreadsheet).to.throw(Error);
  });

  describe('locateLanguage()', function(){
    it("should return translations if language found in array", function(done){
      gruntConfigGetterStub.restore();
      gruntConfigGetterStub = sandbox.stub(grunt.config, "get", function(){
        return "English";
      });

      var array = util.CSVToArray(validCSVResponse);
      var propertyNames = array[0].slice(2);

      steps.locateLanguage(array, propertyNames, function(error, translations, properties){
        expect(error).to.be.null;
        expect(translations).to.be.an('array').to.have.length.of(5);
        expect(properties).to.be.an('array').to.have.length.of(3);

        gruntConfigGetterStub.restore();
        done();
      });
    });

    it("should throw an error if language not found in array", function(){
      var array = util.CSVToArray(validCSVResponse);
      var propertyNames = array[0].slice(2);

      expect(function(){
        steps.locateLanguage(array, propertyNames);
      }).to.throw(Error);
    });
  });

  describe('createJSFile', function(){
    it("should produce an empty JSON object if ran with an empty array", function(done){
      var gruntStub = sandbox.stub(grunt.file, "write");

      steps.createJSFile([], [], function(){
        expect(gruntStub.calledWith("dummy config value.js", "define({});")).to.be.ok;

        gruntStub.restore();
        done();
      });
    });

    it("should have a consistent JSON object", function(done){
      var gruntStub = sandbox.stub(grunt.file, "write");
      var dummyValues = ["en-GB","English","Cheese","Baguette","Saucisson"];
      var dummyProperties = ["keyA","keyB","keyC"];
      var dummyOutput = JSON.stringify({
        keyA: "Cheese",
        keyB: "Baguette",
        keyC: "Saucisson"
      }, null, 4);

      steps.createJSFile(dummyValues, dummyProperties, function(){
        expect(gruntStub.calledWith("dummy config valueen-GB.js", 'define('+dummyOutput+');')).to.be.ok;
        gruntStub.restore();
        done();
      })
    });

    it("should write an empty string to a missing translation", function(done){
      var gruntWriteStub = sinon.stub(grunt.file, "write");
      var gruntLogStub = sinon.stub(grunt.log, "error", function(){
        return;
      });
      var dummyValues = ["en-GB","English","","Baguette","Saucisson"];
      var dummyProperties = ["keyA","keyB","keyC"];
      var dummyOutput = JSON.stringify({
        keyA: "",
        keyB: "Baguette",
        keyC: "Saucisson"
      }, null, 4);


      steps.createJSFile(dummyValues, dummyProperties, function(){
        expect(gruntWriteStub.calledWith("dummy config valueen-GB.js", 'define('+dummyOutput+');')).to.be.ok;
        gruntWriteStub.restore();
        gruntLogStub.restore();
        done();
      });
    });

    it("should write an empty string if translation is NOT_REQUIRED", function(done){
      var gruntWriteStub = sinon.stub(grunt.file, "write");
      var gruntLogStub = sinon.stub(grunt.log, "error", function(){
        return;
      });
      var dummyValues = ["en-GB","English","NOT_REQUIRED","Baguette","Saucisson"];
      var dummyProperties = ["keyA","keyB","keyC"];
      var dummyOutput = JSON.stringify({
        keyA: "",
        keyB: "Baguette",
        keyC: "Saucisson"
      }, null, 4);

      steps.createJSFile(dummyValues, dummyProperties, function(){
        expect(gruntWriteStub.calledWith("dummy config valueen-GB.js", 'define('+dummyOutput+');')).to.be.ok;
        gruntWriteStub.restore();
        gruntLogStub.restore();
        done();
      });
    });
  });
});

describe("Grunt Task INI Translation Tool", function(){
  var sandbox, gruntConfigGetterStub;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();

    gruntConfigGetterStub = sandbox.stub(grunt.config, "get", function(){
      return "dummy config value";
    });
  });

  afterEach(function(){
    sandbox.restore();
  });

  describe('createINIFile', function(){
    it("should produce a valid INI file without translations if ran with an empty array", function(done){
      var gruntStub = sandbox.stub(grunt.file, "write");
      steps.createINIFile([], [], function(){
        expect(gruntStub.calledWith("dummy config value.ini", "[translations]")).to.be.ok;

        gruntStub.restore();
        done();
      });
    });

    it("should not write translation to file if it is missing", function(done){
      var gruntWriteStub = sinon.stub(grunt.file, "write");
      var gruntLogStub = sinon.stub(grunt.log, "error", function(){
        return;
      });
      var dummyValues = ["en-GB","English","","Baguette","Saucisson"];
      var dummyProperties = ["keyA","keyB","keyC"];
      var dummyOutput = '[translations]'+"\n"+
        'keyB = "Baguette"'+"\n"+
        'keyC = "Saucisson"'+"\n";


      steps.createINIFile(dummyValues, dummyProperties, function(){
        expect(gruntWriteStub.calledWith("dummy config valueen-GB.ini", dummyOutput)).to.be.ok;
        gruntWriteStub.restore();
        done();
      })
    });

    it("should not write translation to file if it is NOT_REQUIRED", function(done){
      var gruntStub = sinon.stub(grunt.file, "write");
      var dummyValues = ["en-GB","English","NOT_REQUIRED","Baguette","Saucisson"];
      var dummyProperties = ["keyA","keyB","keyC"];
      var dummyOutput = '[translations]'+"\n"+
        'keyB = "Baguette"'+"\n"+
        'keyC = "Saucisson"'+"\n";


      steps.createINIFile(dummyValues, dummyProperties, function(){
        expect(gruntStub.calledWith("dummy config valueen-GB.ini", dummyOutput)).to.be.ok;
        gruntStub.restore();
        done();
      })
    });

    it("should create a valid INI with translations", function(done){
      var gruntStub = sandbox.stub(grunt.file, "write");
      var dummyValues = ["en-GB","English","Cheese","Baguette","Saucisson"];
      var dummyProperties = ["keyA","keyB","keyC"];
      var dummyOutput = '[translations]'+"\n"+
        'keyA = "Cheese"'+"\n"+
        'keyB = "Baguette"'+"\n"+
        'keyC = "Saucisson"'+"\n";


      steps.createINIFile(dummyValues, dummyProperties, function(){
        expect(gruntStub.calledWith("dummy config valueen-GB.ini", dummyOutput)).to.be.ok;

        gruntStub.restore();
        done();
      })
    });
  });
});