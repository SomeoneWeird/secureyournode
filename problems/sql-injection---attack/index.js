
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
  app.use(bodyParser.urlencoded({ extended: false }));

  app.set('views', path.join(__dirname, 'views'));

  app.get('/', function(req, res) {
    res.render('sqlinjection.ejs', {
      valid: false
    });
  });

  app.post('/', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    function render(valid) {
      res.render('sqlinjection.ejs', {
        valid: valid
      });
    }

    var db = new sqlite.Database(":memory:");

    db.serialize(function() {

      db.run("CREATE TABLE users (username text(128) PRIMARY KEY NOT NULL, password text(128) );");
      db.run("INSERT INTO users (username, password) VALUES ('admin', 'youcheater');");

      if(password == 'youcheater') {
        return render('cheated');
      }

      var query = 'SELECT * FROM users WHERE username="' + username + '" AND password="' + password + '";';

      db.get(query, function(err, row) {

        if(err) {
          return res.render('sqlinjection.ejs', {
            valid: 'error',
            error: err
          });
        }

        if(!row) {
          return render(false);
        }

        render(true);
        cb(true);

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
