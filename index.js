#!/usr/bin/env node

"use strict";

var path      = require('path');
var adventure = require('adventure');
var syn       = adventure('secureyournode');

var problems = require('./menu');

problems.forEach(function (problem) {
  var p = problem.toLowerCase().replace(/\s/g, '-');
  var dir = path.join(__dirname, 'problems', p);
  syn.add(problem, function () { return require(dir); });
});

syn.execute(process.argv.slice(2));
