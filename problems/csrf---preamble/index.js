
"use strict";

var opn        = require('opn');
var express    = require('express');
var bodyParser = require('body-parser');
var openport   = require('openport');

exports.problem = "Please run `secureyournode verify` to start!";

exports.verify = function(args, cb) {

  var server;

  var app = express();

  app.use(bodyParser.json());

  app.post('/test', function(req, res) {
    if(req.body.hello == 'world' && req.body.test == true) {
      res.json({
        success: true,
        message: "Congrats! On to the next lesson."
      });
      cb(true);
      setTimeout(function() {
        process.exit(0);
      }, 1000);
    } else {
      res.json({
        success: false,
        message: "OOPS! That didn't work, are you sure you're sending as JSON? (correct Content-Type header?)" 
      });
    }
  });

  openport.find(function(err, port) {

    if(err) {
      console.error("Can't find an open port! Error:", err);
      return process.exit(1);
    }

    server = app.listen(port, function() {
      
      console.log("Please use an external tool to post the JSON { hello: 'world', test: true } to http://127.0.0.1:" + port + "/test");

    });

  });

};

exports.run = function(args) {

  console.log("Please use `verify` instead of `run` :)");
  process.exit(0);

};
