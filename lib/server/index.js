var WebSocketServer = require('ws').Server
var http = require('http')
var websocket = require('websocket-stream')
var through = require('through2');
var dataplex = require('dataplex');

var debug = require('debug')('server');

var url = module.exports.url = 'ws://localhost:' + module.exports.port

var server;


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

  wss.on('connection', function (ws) {

    // var url = ws.upgradeReq.url;

    var stream = websocket(ws);
    var plex = dataplex();
    stream.pipe(plex).pipe(stream);
    stream.plex = plex;
    server.emit('wsconnection', stream)

});

  server.listen(port, function(err){
    cb(null, server);
  });

}

module.exports.stop = function(cb) {
  if (!server) {
    cb(new Error('not started'))
    return
  }

  server.close(cb)
  server = null
}