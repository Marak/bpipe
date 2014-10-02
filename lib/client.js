var client = {};
module['exports'] = client;

var ws = require('websocket-stream');
var through = require('through2');

client.connect = function (opts, callback) {
  var stream;

  var inputStream = opts.input || process.stdin;
  var outputStream = opts.output || process.stdout;


  var selector = opts.selector, event = opts.event, url = opts.url, uri = opts.uri, data = opts.data;
  stream = ws(uri);

  var command = {
    "selector": selector,
    "event": event,
    "source": "bpipe",
    "url": url,
    "data": data
  };

  stream.on('error', function(err){
    if (err.code = "ECONNREFUSED") {
      console.log('Unable to connect to bpipe server. Try running `bpipe-server`.')
      process.exit();
    } else {
      throw err;
    }
  });

  if (command.selector) {
    stream.write(JSON.stringify(command))
  }

  // pipe any STDIN data to bpipe server
  inputStream.pipe(through(function(chunk, enc, cb){
    var data = {
      "source": "bpipe",
      "selector": selector,
      "data": chunk.toString(),
      "url": url
    };
    cb(null, JSON.stringify(data));
  })).pipe(stream);

  // write all incoming data to STDOUT
  stream.pipe(through.obj(function(data, enc, cb){
    data = JSON.parse(data.toString());
    outputStream.write(JSON.stringify(data.data) + "\n")
    cb();
  }));

  // create stream to local server
  callback(null, stream);
  return stream;

};