
"use strict";

var path = require('path');
var fs   = require('fs');

var opn        = require('opn');
var ejs        = require('ejs');
var express    = require('express');
var bodyParser = require('body-parser');
var openport   = require('openport');

exports.problem = "Please run `secureyournode verify` to start!";

exports.verify = function(args, cb) {

  var posts = [];

  var success = false;

  var server;

  var app = express();

  app.use(express.static(path.join(__dirname, 'static')));
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get('/', function(req, res) {
    res.render('xssinjection.ejs', {
      data: {
        posts:   posts,
        success: success
      }
    });
  });

  app.post('/addposts', function(req, res) {
    posts.push(req.body);

    [ req.body.title, req.body.body ].forEach(function(s) {
      if(/<script>alert\(['"]?5['"]?\);?<\/script>/.test(s)) {
        success = true;
      }
    });

    res.redirect('/');

    if(success) {
      cb(true);
      setTimeout(function() {
        process.exit(0);
      }, 1000);
    }

  });

  openport.find(function(err, port) {

    if(err) {
      console.error("Can't find an open port! Error:", err);
      return process.exit(1);
    }

    server = app.listen(port, function() {
      opn('http://127.0.0.1:' + port + '/');
    });

  });

};

exports.run = function(args) {

  console.log("Please use `verify` instead of `run` :)");
  process.exit(0);

};
