
"use strict";

var path = require('path');
var fs   = require('fs');

var ncp       = require('ncp').ncp;
var supertest = require('supertest');
var async     = require('async');

exports.problem = "Please run `secureyournode run` to copy files.";

exports.verify = function(args, cb) {

  var attemptPath = path.resolve(process.cwd(), args[0]);

  try {
    fs.statSync(attemptPath);
  } catch(e) {
    console.error("\n%s doesn't exist! Please check you're in the right directory.\n", args[0]);
    return process.exit(1);
  }

  var attempt = require(attemptPath);

  if(!attempt.app) {
    console.error("\nYour attempt is no longer exporting `app`, please re-add the code under the 'Do Not Edit' section :)\n");
    return cb(false);
  }

  var request = supertest(attempt.app);

  async.series([

    function(done) {

      request.post('/login')
      .send({
        username: '',
        password: ''
      })
      .end(function(err, response) {
        if(err) return done(err);

        if(response.body.valid !== false) {
          return done("Hmm, logging in with no credentials yielded a valid login?");
        }

        return done();

      });

    },

    function(done) {

      request.post('/login')
      .send({
        username: 'admin',
        password: 'password'
      })
      .end(function(err, response) {
        if(err) return done(err);

        if(response.body.valid !== true) {
          return done("Hmm, couldn't login with admin:password, did you change the login? :)");
        }

        return done();

      });

    },

    function(done) {

      request.post('/login')
      .send({
        username: 'admin',
        password: 'x" OR 1=1;--'
      })
      .end(function(err, response) {
        if(err) return done(err);

        if(response.body.valid !== false) {
          return done("Uhoh, looks like you're still vulnerable to SQL Injection!");
        }

        return done();

      });

    }

  ], function(err) {

    if(err) {
      console.error("\nOOPS, looks like something went wrong!\n\n%s\n", err);
      return cb(false);
    }

    console.log("\nCongratulations! Looks like you've successfully protected against basic SQL Injection attacks.");
    console.log("Hopefully in the future there will be more challenges involving other types of attacks.");

    return cb(true);

  });

};

exports.run = function(args) {

  var folderName = "sql-defend-files";
  var userPath   = path.join(process.cwd(), folderName);

  try {
    if(fs.statSync(userPath)) {
      console.log("You already have a folder called sql-defend-files, remove it and run this again.");
      return;
    }
  } catch(e) {};

  ncp(path.join(__dirname, folderName), userPath, function(err) {

    if(err) {
      console.error("There was an error copying files:", err);
      process.exit(1);
    }

    console.log('Files were copied to %s, open server.js in your favourite text-editor to get started!', folderName);
    process.exit(0);

  });

};
