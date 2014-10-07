var client = {};
module['exports'] = client;

var ws = require('websocket-stream');
var through = require('through2');
var dataplex = require('dataplex');

client.connect = function (opts, callback) {
  var stream;

  var inputStream = opts.input || process.stdin;
  var outputStream = opts.output || process.stdout;

  var plex = dataplex();

  var selector = opts.selector, 
  event = opts.event, 
  url = opts.url, 
  uri = opts.uri, 
  data = opts.data;

  var con = ws(uri);

  con.pipe(plex).pipe(con);

  /*
  var stream2 = plex.open('/foo');
  stream2.pipe(through(function(chunk, enc, file){
    console.log('got foo data');
  }));
  */

  var _url = require('url');
  var pipePath = _url.parse(uri).path;
  if (pipePath === null) {
    // default pipe path is querySelector
    pipePath = "/querySelector";
  }

  // open multiplex stream based on incoming pipePath
  var stream = plex.open(pipePath);
  stream.on('end', function (){
    console.log('stream ended')
    inputStream.end();
    con.end();
  });


  stream.on('error', function(err){
    if (err.code = "ECONNREFUSED") {
      console.log('Unable to connect to bpipe server. Try running `bpipe-server`.');
      process.exit();
    } else {
      throw err;
    }
  });

  // open the specific client code for this type of pipe
  var pipe = require('../pipes' + pipePath + '/client');
  // pipe the inputStream to the remote stream
  pipe(opts, inputStream, stream);

  // write all incoming data to the outputStream ( by default is STDOUT )
  stream.pipe(through.obj(function(data, enc, cb){
    data = JSON.parse(data.toString());
    outputStream.write(JSON.stringify(data.data) + "\n")
    cb();
  }));

  // create stream to local server
  callback(null, stream);
  return stream;

};