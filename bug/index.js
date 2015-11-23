'use strict';
var util        = require('util'),
    yeoman      = require('yeoman-generator'),
    fs          = require('fs'),
    path        = require('path'),
    JiraFacade  = require('jira-facade'),
    Q           = require('q'),
    util        = require('util');

var JiraGenerator = module.exports = function JiraGenerator(args, options) {
  var _this = this;
  yeoman.generators.Base.apply(_this, arguments);

  _this.on('end', function () {
    console.log( util.format("New BUG created %s", _this.new_issue_id) );
  });

  _this.readFileAsString = require("html-wiring").readFileAsString;
  try {
    //var joptions = this.readFileAsString( process.env.YOJIRA );
    var joptions = fs.readFileSync(path.resolve(process.env.YOJIRA), 'utf8');
    _this.jira_options = JSON.parse(joptions);
  } catch(err) {
    _this.env.error("YOJIRA environment variable must point to a JSON file with yojira options");
  }

  _this.jiraFacade = new JiraFacade({
    protocol: _this.jira_options.protocol || "https",
    host: _this.jira_options.host || "localhost",
    port: _this.jira_options.port || 443,
    username: _this.jira_options.credentials.user,
    password: _this.jira_options.credentials.password,
    apiVersion: _this.jira_options.apiVersion || '2.0.alpha1',
  });
};

util.inherits(JiraGenerator, yeoman.generators.Base);

JiraGenerator.prototype.askFor = function askFor() {
  var _this = this;
  var cb = _this.async();

  var prompts = [];

  prompts.push({
    type: 'input', // TODO generate list of projects from jira
    name: 'project',
    message: 'What Project are you filing for?',
    validate: function validateProject(value) {
      return value === "" ? "Project Name is required" : true;
    }
  });

  prompts.push({
    type: 'input',
    name: 'summary',
    message: 'Just the elevator pitch (summary)',
    validate: function validateProject(value) {
      return value === "" ? "Summary is required" : true;
    }
  });

  prompts.push({
    type: 'list',
    name: 'priority',
    message: 'How important is it?',
    choices: _this.jira_options.priorities, 
    default: 1
  });

  prompts.push({
    type: 'input',
    name: 'observation',
    message: 'Tell me what happened',
    validate: function validateProject(value) {
      return value === "" ? "Observation is required" : true;
    }
  });

  prompts.push({
    type: 'input',
    name: 'expectation',
    message: 'What did you expect to happen?',
    validate: function validateProject(value) {
      return value === "" ? "Expectation is required" : true;
    }
  });

  prompts.push({
    type: 'input',
    name: 'assignee',
    message: 'Who should look into this?',
    validate: function validateProject(value) {
      return value === "" ? "Assignee is required" : true;
    }
  });

  _this.prompt(prompts, function (response) {
    _this.project = response.project;
    _this.summary = response.summary;
    _this.priority = response.priority;
    _this.observation = response.observation;
    _this.expectation = response.expectation;
    _this.assignee = response.assignee;
    console.dir({
      project: _this.project,
      issueType: 'Bug',
      summary: _this.summary,   
      description: util.format("Observation:\n%s\nExpectation:\n%s", _this.observation, _this.expectation),
      assignee: _this.assignee,
      reporter: _this.jira_options.credentials.user,
      priority: _this.priority
    });
    _this.jiraFacade.createIssue({
      project: _this.project,
      issueType: 'Bug',
      summary: _this.summary,   
      description: util.format("Observation:\n%s\nExpectation:\n%s", _this.observation, _this.expectation),
      assignee: _this.assignee,
      reporter: _this.jira_options.credentials.user,
      priority: _this.priority
    }, function(err, issue){
      if(err) {
        console.log(util.format("%j", err));
        cb(err);
      } else {
        console.log("createIssue callback %j", issue);
        _this.new_issue_id = issue && issue.id ? issue.id : undefined;
        cb();
      }
    });
  }.bind(_this));
};

JiraGenerator.prototype.app = function projectFiles() {
  // authenticate with jira server and create the new ticket  
  /*JiraApi.findIssue(issueNumber, function(error, issue) {
      console.log('Status: ' + issue.fields.status.name);
  });*/
};
