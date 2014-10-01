var tap = require("tap");

var through = require('through2');
var bpipeServer = require('../lib/server');
var bpipeClient = require('../lib/client');
var server,
    client;

tap.test('can start the bpipe-server', function (t) {
  
  bpipeServer.start({ port: 8001 }, function (err, _server){
    if (err) {
      console.error(err);
      return;
    }

    server = _server;

    t.equal(err, null);
    t.end();
  });
  
});

tap.test('bpipe can connect to bpipe-server', function (t) {
  
  //
  // Create generic read input stream for emulating STDIN
  //
  var input = through(function (chunk, enc, callback) {
    this.push(chunk.toString())
    callback()
  });

  //
  // Create generic write input stream for emulating STDOUT
  //
  var output = through(function (chunk, enc, callback) {
    console.log('OUTPUT:', chunk.toString())
    this.push(chunk.toString());
    callback()
  })

  var Writable = require('stream').Writable;
  var output = new Writable;

  client = bpipeClient.connect({ 
    uri: "ws://localhost:8001",
    selector: "#myDiv",
    input: input,
    output: output
  }, function (err, _server){
    if (err) {
      console.error(err);
      return;
    }

    input.write('hi tgere')
    // after it's connected, try sending a command

    t.equal(err, null);
    t.end();
  });
  
});

tap.test('bpipe can close connection to bpipe-server', function (t) {
//  process.stdin.end();
  client.end(function(){
    t.end();
  });
  
});


tap.test('can stop the bpipe server', function (t) {
  
  server.close(function(){
    t.ok("can close server")
    t.end();
  });
  
});