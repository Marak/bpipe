var WebSocketServer = require('ws').Server
var http = require('http')
var websocket = require('websocket-stream')
var through = require('through2');

var debug = require('debug')('server');

var url = module.exports.url = 'ws://localhost:' + module.exports.port

var bpipes = {};
var browsers = {};
var server;


var handleBrowser = require('./browser-stream');

var handleBpipe = require('./bpipe-stream');

module.exports.start = function(opts, cb) {
  
  if (typeof opts == 'function') {
    cb = opts;
    opts = {};
  }

  opts = opts || {};

  var port = opts.port || 8001;
  var wssOpts = {};

  if (typeof opts.server === "undefined") {
    server = http.createServer();
    wssOpts.server = server;
  } else {
    server = opts.server
    wssOpts.server = server;
  }

  var wss = new WebSocketServer(wssOpts)

  wss.on('connection', function(ws) {
    var stream = websocket(ws);

    stream.pipe(through(function(chunk, enc, cb) {
      debug('getting data from stream', chunk.toString())
      var data = JSON.parse(chunk.toString());
      data.url = data.url || "default";
      if (data.source === "browser") {
        // data is coming in from the browser
        handleBrowser(chunk, browsers, bpipes, data, stream);
      } else { 
        // data is coming from the bpipe client, not the browser
        handleBpipe(chunk, browsers, bpipes, data, stream);
      }
      cb();
    }))
  });

  server.listen(port, function(err){
    cb(null, server);
  })

}

module.exports.stop = function(cb) {
  if (!server) {
    cb(new Error('not started'))
    return
  }

  server.close(cb)
  server = null
}