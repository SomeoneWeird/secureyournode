
"use strict";

var path = require('path');
var fs   = require('fs');

var opn        = require('opn');
var ejs        = require('ejs');
var express    = require('express');
var bodyParser = require('body-parser');
var openport   = require('openport');
var sqlite     = require('sqlite3');

exports.problem = "Please run `secureyournode verify` to start!";

exports.verify = function(args, cb) {

  var server;

  var app = express();

  app.use(express.static(path.join(__dirname, 'static')));
  app.use(bodyParser.json());

  app.set('views', path.join(__dirname, 'views'));

  app.get('/', function(req, res) {
    res.render('sqlinjection.ejs');
  });

  app.post('/login', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if(password == 'password') {
      return res.json({
        cheated: true
      });
    }

    var db = new sqlite.Database(":memory:");

    db.serialize(function() {

      db.run("CREATE TABLE users (username text(128) PRIMARY KEY NOT NULL, password text(128) );");
      db.run("INSERT INTO users (username, password) VALUES ('admin', 'password');");

      var query = 'SELECT * FROM users WHERE username="' + username + '" AND password="' + password + '";';

      db.get(query, function(err, row) {

        if(err) {
          return res.json({
            valid: 'error',
            error: err
          });
        }

        if(!row) {
          return res.json({
            valid: false
          });
        }

        cb(true);

        res.json({
          valid:    true,
          username: username
        });

        setTimeout(function() {
          process.exit(0);
        }, 1000);

      });

    });

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
