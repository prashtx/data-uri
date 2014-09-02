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

app.get('/reverse', function (req, res, next) {
  var uri = decodeURIComponent(req.query.uri);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accepts, Accept-Encoding, User-Agent');

  if (uri.slice(0, 5) !== 'data:') {
    res.send(400, 'Expected "data:"');
    return;
  }

  var md = uri.split(':')[1].split(',');

  if (md.length !== 2) {
    res.send(400, 'Expected exactly one ","');
    return;
  }

  var metadata = md[0].split(';');
  var data = md[1];

  if (metadata[metadata.length - 1] !== 'base64') {
    res.send(400, 'We only support base64 encoding right now.');
    return;
  }

  var h = 0;
  var contentType = 'text/plain';
  if (metadata[0].indexOf('=') === -1) {
    contentType = metadata[0];
    h = 1;
  }

  var headers = {};

  var piece;
  var i;
  for (i = h; i < metadata.length - 1; i += 1) {
    piece = metadata[i].split('=');
    headers[piece[0]] = piece[1];
  }

  res.set('Content-Type', contentType);

  if (headers['content-disposition']) {
    if (headers.filename) {
      res.set('Content-Disposition', headers['content-disposition'] + '; filename=' + headers.filename);
    } else {
      res.set('Content-Disposition', headers['content-disposition']);
    }
  }


  var buf = new Buffer(data, 'base64');
  res.send(buf.toString());
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
