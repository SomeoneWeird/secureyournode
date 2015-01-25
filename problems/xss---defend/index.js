
"use strict";

var path = require('path');
var fs   = require('fs');

var ncp       = require('ncp').ncp;
var supertest = require('supertest');
var async     = require('async');
var cheerio   = require('cheerio');

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
    console.error("Your attempt is no longer exporting `app`, please re-add the code under the 'Do Not Edit' section :)");
    return process.exit(1);
  }

  var request = supertest(attempt.app);

  var error = function(err) {
    console.error("OOPS! There was an error:", err);
    return cb(false);
  }

  request.get('/')
  .expect(200)
  .end(function(err, res) {

    if(err) return error(err);

    var $ = cheerio.load(res.text);

    request.get('/posts')
    .expect(200)
    .send('Accept', 'application/json')
    .end(function(err, res) {

      if(err) return error(err);

      if(res.body.length > 0) {
        console.error("You have pre-added posts, please remove them and reverify");
        return cb(false);
      }

      request.post('/addpost')
      .send('Content-Type', 'application/json')
      .send({ title: "hello", text: "world" })
      .expect(302)
      .end(function(err) {

        if(err) return error(err);

        request.get('/posts')
        .expect(200)
        .send('Accept', 'application/json')
        .end(function(err, res) {

          if(err) return error(err);

          if(res.body.length == 0) {
            console.error("\nFor some reason posts aren't being added! Try re-verifying when you've fixed this.\n");
            return cb(false);
          }

          if(res.body[0].title != "hello" || res.body[0].text != "world") {
            console.error("\nHmm, posts don't seem to be added properly, try again.\n");
            return cb(false);
          }

          request.post('/addpost')
          .send('Content-Type', 'application/json')
          .send({ title: "<b>hello</b>", text: "<b>world</b>" })
          .expect(302)
          .end(function(err) {

            if(err) return error(err);

            request.get('/posts')
            .expect(200)
            .send('Accept', 'application/json')
            .end(function(err, res) {

              if(err) return error(err);

              console.log(res.body[1]);
              
              // TODO: fix this
              if(res.body[1].title == "<b>hello</b>" || res.body[1].text == "<b>world</b>") {
                console.error("\nOOPS! Doesn't seem like you've escaped things properly!\n");
                return cb(false);
              }

              return cb(true);

            });

          });

        });

      });

    });

  });

};

exports.run = function(args) {

  var folderName = "xss-defend-files";
  var userPath   = path.join(process.cwd(), folderName);

  try {
    if(fs.statSync(userPath)) {
      console.log("You already have a folder called xss-defend-files, remove it and run this again.");
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
