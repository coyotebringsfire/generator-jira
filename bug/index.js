'use strict';
var util    = require('util'),
    yeoman  = require('yeoman-generator'),
    fs      = require('fs'),
    path    = require('path'),
    JiraApi = require('jira').JiraApi,
    Q       = require('q');

var JiraGenerator = module.exports = function JiraGenerator(args, options) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    // this.installDependencies({ skipInstall: options['skip-install'] });
    this.installDependencies({
      npm: true,
      bower: false,
      skipInstall: options['skip-install'],
      callback: function() {
        console.log('Everything is ready!');
      }
    });
  });

  this.readFileAsString = require("html-wiring").readFileAsString;
  try {
    //var joptions = this.readFileAsString( process.env.YOJIRA );
    var joptions = fs.readFileSync(path.resolve(process.env.YOJIRA), 'utf8');
    this.jira_options = JSON.parse(joptions);
  } catch(err) {
    this.env.error("YOJIRA environment variable must point to a JSON file with yojira options");
  }

  this.projects = new Q.Promise(function (reject, resolve) {
    this.jira.listProjects(function(err, projects) {
      if(err) {
        reject(err);
      } else {
        resolve(JSON.parseprojects);
      }
    });
  });
  this.jira = new JiraApi('https', this.jira_options.host, this.jira_options.port, this.jira_options.credentials.user, this.jira_options.credentials.password, '2.0.alpha1');
};

util.inherits(JiraGenerator, yeoman.generators.Base);

JiraGenerator.prototype.askFor = function askFor() {
  this.projects.then(function onProjectsReady(projects) {
      var cb = this.async();

      // have Yeoman greet the user.
      console.log(this.yeoman);

      var prompts = [];

      prompts.push({
        type: 'input', // TODO generate list of projects from jira
        name: 'project',
        message: 'What Project are you filing for?',
        choices: ['FILLER'], 
        default: 'FILLER'
      });

      prompts.push({
        type: 'input',
        name: 'summary',
        message: 'Just the elevator pitch (summary)',
        default: ''
      });

      prompts.push({
        type: 'list',
        name: 'priority',
        message: 'How important is it?',
        choices: [1, 2, 3, 4, 5], 
        default: 1
      });

      prompts.push({
        type: 'list',
        name: 'severity',
        message: 'How severe is it?',
        choices: [1, 2, 3, 4, 5], 
        default: 1
      });

      prompts.push({
        type: 'input',
        name: 'observation',
        message: 'Tell me what happened',
        default: ''
      });

      prompts.push({
        type: 'input',
        name: 'expectation',
        message: 'What did you expect to happen?',
        default: ''
      });

      prompts.push({
        type: 'input',
        name: 'assignee',
        message: 'Who should look into this?',
        default: ''
      });

      this.prompt(prompts, function (response) {
        this.project = response.project;
        this.summary = response.summary;
        this.priority = response.priority;
        this.severity = response.severity;
        this.observation = response.observation;
        this.expectation = response.expectation;
        this.assignee = response.assignee;
        cb();
      }.bind(this));
  });
};

JiraGenerator.prototype.app = function projectFiles() {
  // authenticate with jira server and create the new ticket  
  jira.findIssue(issueNumber, function(error, issue) {
      console.log('Status: ' + issue.fields.status.name);
  });
};
