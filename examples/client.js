// client.js - opens a basic bpipe client up and performs some commands

var bpipeClient = require('../lib/client');

var through = require('through2');

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

  /*
  // can send HTML to body if no elements are specified
  client = bpipeClient.connect({ 
    uri: "ws://localhost:8001",
    input: input,
    output: output
  }, function (err, _server){
    if (err) {
      console.error(err);
      return;
    }
    input.write('hello there');
    input.end();
    // after it's connected, try sending a command

  });
  */
  
  /*
  // can send HTML to an an element by ID on the browser
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
  
  */