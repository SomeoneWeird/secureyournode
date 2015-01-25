#!/usr/bin/env node

/*

  To solve: prevent XSS when posts are added

  NOTE: You do not need to change any of the html templates to complete this problem! 

*/

"use strict";

var path = require("path");

var express    = require("express");
var bodyParser = require("body-parser");
var ejs        = require("ejs");

var posts = [];

var app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(request, response) {
  response.render('index.ejs', {
    posts: posts
  });
});

app.post('/addpost', function(request, response) {
  posts.push({
    title: request.body.title,
    text:  request.body.text
  });
  response.redirect('/');
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
