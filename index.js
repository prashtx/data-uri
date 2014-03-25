'use strict';

var server = require('./lib/server');

server.start(function (error, stop) {
  if (error) {
    throw error;
  }
});
