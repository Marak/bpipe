var WebSocketServer = require('ws').Server
var http = require('http')
var websocket = require('websocket-stream')
var through = require('through2');

var debug = require('debug')('server');

var url = module.exports.url = 'ws://localhost:' + module.exports.port

var bpipes = {};
var browsers = {};
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

  wss.on('connection', function(ws) {
    var stream = websocket(ws);

    stream.pipe(through(function(chunk, enc, cb) {
      debug('getting data from stream', chunk.toString())
      var data = JSON.parse(chunk.toString());
      // determine if websocket connection is from browser or from command line
      if (data.source === "browser") {
        // new browser connecting for the first time
        if (typeof data.id !== "undefined") {
          debug('new browser being added', data.id)
          browsers[data.id] = {
            stream: stream,
            url: data.url
          };
          // check to see if any streams are waiting for potential events
          for (var bpipe in bpipes) {
            // re-run all listening pipes on new browser
            var send = {
              "selector": bpipes[bpipe].selector,
              "event": bpipes[bpipe].event,
              "source": "bpipe",
              "url": data.url
            };
            var found = false;
            if (bpipe === data.url) {
              found = true;
              debug('trying to send out', bpipe, send)
              stream.write(JSON.stringify(send));
            }
          }
          if(!found) {
            debug('trying to send out', 'default', send)
            if (typeof bpipes['default'] !== "undefined" && bpipes['default'].stream !== "undefined") {
              try {
                // TODO: there should be an event that is emitted when stream.write is no longer open
                bpipes['default'].stream.write(JSON.stringify(send));
              } catch(err) {
                // browser stream is no longer there, delete it so we don't attempt to write again
                delete bpipes['default'];
              }
            }
          }
        }

        // then pipe the information back to bpipe connection looking for el
        var found = false;
        if (typeof bpipes[data.url] !== 'undefined' && typeof bpipes[data.url][data.selector] !== "undefined") {
          found = true;
          bpipes[data.url][data.selector].stream.write(chunk.toString())
        }
        if (!found) {
          debug('trying to send out', 'default', send)
          if (typeof bpipes['default'] !== "undefined" && bpipes['default'][data.selector] !== "undefined" && bpipes['default'][data.selector].stream !== "undefined") {
            bpipes['default'][data.selector].stream.write(chunk.toString());
          }
        }

      } else {

        if (typeof bpipes[data.url] === 'undefined') {
          bpipes[data.url] = {};
        }
        // then data is coming from bpipe, send it to the browser
        bpipes[data.url][data.selector] = {
          stream: stream,
          selector: data.selector,
          event: data.event,
          url: data.url
        };

        for (var browser in browsers) {
          if(browsers[browser].url === data.url || data.url === "default") {
            try {
              // TODO: there should be an event that is emitted when stream.write is no longer open
              browsers[browser].stream.write(chunk.toString())
              debug('writing to ' + data.url)
            } catch(err) {
              // browser stream is no longer there, delete it so we don't attempt to write again
              delete browsers[browser];
            }
          }
        }
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