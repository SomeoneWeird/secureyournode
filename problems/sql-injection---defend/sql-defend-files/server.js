#!/usr/bin/env node

/*

  To solve: prevent SQL injection when a user logs in

  NOTE: You do not need to change any of the html templates to complete this problem! 

*/

"use strict";

var path = require("path");

var express    = require("express");
var bodyParser = require("body-parser");
var ejs        = require("ejs");
var sqlite     = require('sqlite3');

var app = express();

// Here we setup our in-memory database
var db = new sqlite.Database(":memory:");

// Create our users table & insert some dummy data
db.serialize(function() {
  db.run("CREATE TABLE users (username text(128) PRIMARY KEY NOT NULL, password text(128));");
  db.run("INSERT INTO users (username, password) VALUES ('admin', 'password');");
});

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.render('index.ejs');
});

app.post('/login', function(request, response) {

  var username = request.body.username;
  var password = request.body.password;

  if(!username || !password) {
    return response.json({
      valid: false
    });
  }

  var query = 'SELECT * FROM users WHERE username="' + username + '" AND password = "' + password + '";';

  db.get(query, function(err, row) {

    if(err) {
      console.error("OOPS! There was an error:", err);
      return response.sendStatus(500);
    }

    if(!row) {
      return response.json({
        valid: false
      });
    }

    response.json({
      valid:    true,
      username: username
    });

  });

});

/*** Please do not change anything below this line ***/
if(require.main === module) {
  var port = parseInt(process.env.PORT) || 8080;
  app.listen(port, function(err) {
    if(err) {
      console.error("Error listening on port %d:", port, err);
      process.exit(1);
    }
    console.log("Listening on port", port);
  });
} else {
  exports.app = app;
}
