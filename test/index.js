/*global describe, beforeEach, it*/
'use strict';

var path 		= require('path'),
		fs 			= require('fs'),
		yeoman 	= require('yeoman-generator'),
		helpers = yeoman.test,
		assert 	= yeoman.assert,
		async		= require('async'),
		util 		= require('util'),
		os 			= require('os'),
		path 		= require('path'),
		should  = require('should');


var testProject = {
	name: "YOTEST",
	summary: "this is a test ticket",
	priority: 1,
	severity: 1,
	assignee: "scapegoat",
	expectation: "it should do this thing",
	observation: "it does this thing",
	description: "it does this",
	acceptance_criteria: "it passes all tests"
};

var types = {
	"BUG":0,
	"IMPROVEMENT":1,
	"TASK": 2,
	"NEWFEATURE": 3
};

var testTickets = [
	{
		project : testProject.name,
		type: types.BUG,
		summary: testProject.summary,
		priority: testProject.priority,
		severity: testProject.severity,
		assignee: testProject.assignee,
		expectation: testProject.expectation,
		observation: testProject.observation,
		labels: [ "TEST" ]
	}
];

var msgs = {
	INVALIDENV: "YOJIRA environment variable must point to a JSON file with yojira options"
};

function makePrompt(ticket_type) {
	var prompt = {
	  	'project': testProject.name,
	    'type': ticket_type,
	    'summary': testProject.summary,
	    'priority': testProject.priority,
	    'severity': testProject.severity,
	    'assignee': testProject.assignee
	  };
	switch( ticket_type ) {
		case "BUG":
			prompt.expectation = testProject.expectation;
			prompt.observation = testProject.observation;
			break;
		case "IMPROVEMENT":
			prompt.description = testProject.description;
			break;
		case "NEWFEATURE":
			prompt.description = testProject.description;
			prompt.acceptance_criteria = testProject.acceptance_criteria;
			break;
		default:
			break;
	}
	return prompt;
			
}
describe('jira ticket generator', function () {
  it.skip("should use Environment.error with a useful message if YOJIRA environment variable does not point to a json file", function doIt(done) {
  	process.env["YOJIRA"] = "/invalidfile";
    helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        'skip-install': true
      })
      .on('error', function onError(err) {
      	err.message.should.equal(msgs.INVALIDENV);
      	done();
      });
  });

  it.only("should use jira server information from yojira.json file specified in YOJIRA environment variable", function doIt(done) {
  	// TODO start a fake jira server and use it to verify yojira.json
  	// for now use the settings in yojira.json
  	// fs.writeFileSync( path.join( os.tmpdir(), "yojira.json" ), JSON.stringify({}) );
  	var jiraOptions = JSON.parse( fs.readFileSync( process.env["YOJIRA"] ) );
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, './temp'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        'project': 'YOTEST',
        'type': 'BUG',
        'summary': "TEST SUMMARY",
        'priority': 1,
        'severity': 1,
        'observation':'',
        'expectation':'',
        'assignee':'DEVELOPER'
      })
      .on('end', function () {
      	// TODO verify new jira ticket is created
        done();
      });
  });

  async.each([ Object.keys(types) ], function createDifferentTypes(ticket_type, finished) {
  	describe( util.format("%s type", ticket_type), function () {
	  	it( util.format('should create a %s ticket', ticket_type), function doIt(done) {
		    helpers.run(path.join(__dirname, '../app'))
		      .inDir(path.join(__dirname, './temp'))
		      .withOptions({
		        'skip-install': true
		      })
		      .withPrompt( makePrompt(ticket_type) )
		      .on('ready', function (generator) {
		        // TODO connect to jira and execute query
		      })
		      .on('end', function () {
		        assert.fileContent('results.json', /success/);
		        done();
		      });
		  });
  	});
  });

});
