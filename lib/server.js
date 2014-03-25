'use strict';

var http = require('http');

var express = require('express');
var request = require('request');

var config = require('./config');

var app = express();

app.use(express.compress());

app.get('/convert', function (req, res, next) {
  var remote = decodeURIComponent(req.query.url);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accepts, Accept-Encoding, User-Agent');

  request.get({
    url: remote,
    encoding: null
  }, function (error, response, body) {
    if (error) {
      console.log(error);
      res.send(500);
      return;
    }

    var data = body.toString('base64');
    var uri = 'data:' + response.headers['content-type'] + ';base64,' + data;
    res.send({
      uri: uri
    });
  });
});

exports.start = function start(done) {
  var server = http.createServer(app);
  server.listen(config.port, function (error) {
    if (error) {
      return done(error);
    }
    console.log('Listening on port ' + config.port);
    done(null, function (next) {
      server.close(next);
    });
  });
};
