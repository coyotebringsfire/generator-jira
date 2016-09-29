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
        type: 'list',
        name: 'type',
        message: 'What kind of ticket is this?',
        choices: ['BUG', 'IMPROVEMENT', "NEWFEATURE"], 
        default: 'BUG'
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
        when: function(answers) { return answers.type === 'BUG'; },
        type: 'input',
        name: 'observation',
        message: 'Tell me what happened',
        default: ''
      });

      prompts.push({
        when: function(answers) { return answers.type === 'BUG'; },
        type: 'input',
        name: 'expectation',
        message: 'What did you expect to happen?',
        default: ''
      });

      prompts.push({
        when: function(answers) { return answers.type === 'IMPROVEMENT'; },
        type: 'input',
        name: 'description',
        message: 'Tell me what what you want improved',
        default: ''
      });

      prompts.push({
        when: function(answers) { return answers.type === "NEWFEATURE"; },
        type: 'input',
        name: 'description',
        message: 'Give me the details',
        default: ''
      });

      prompts.push({
        when: function(answers) { return answers.type === "NEWFEATURE"; },
        type: 'input',
        name: 'acceptance_criteria',
        message: 'How will I know when I am done?',
        default: ''
      });

      this.prompt(prompts, function (response) {
        this.project = response.project;
        this.type = response.type;
        this.summary = response.summary;
        this.priority = response.priority;
        this.severity = response.severity;
        this.observation = response.observation;
        this.expectation = response.expectation;
        this.description = response.description;
        this.acceptance_criteria = response.acceptance_criteria;
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
  // scaffold out the tests based on env
  /*if (this.environment === 'Node') {
    this.template('_spec-node.js', 'spec/' + this.file);
    if( fs.existsSync(path.resolve(process.cwd(), 'package.json')) ) {
      pkg = JSON.parse( this.readFileAsString( path.resolve( process.cwd(), 'package.json' ) ) );
      pkg.scripts.test = "mocha ./spec/",
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) );
    } else {
      this.template('_package.json', 'package.json');
    }
  } else if (this.environment === 'browser') {
    this.template('_index.html', 'index.html');
    this.template('_spec-browser.js', 'spec/' + this.file);
    this.template('_bower.json', 'bower.json');
    this.copy('bowerrc', '.bowerrc');
  }

  // Create the src file if one doesn't already exist
  if (!fileExists) {
    this.template((this.environment === 'Node' ? '_src-node.js' : '_src-browser.js'), this.file);
  }*/

  // this.copy('editorconfig', '.editorconfig');
  // this.copy('jshintrc', '.jshintrc');
};
