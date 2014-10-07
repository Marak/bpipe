var through = require('through2');

module['exports'] = function openClientPipe (opts, inputStream, stream) {

  var selector = opts.selector, 
  event = opts.event, 
  url = opts.url, 
  uri = opts.uri, 
  data = opts.data;

  var command = {
    "selector": selector,
    "event": event,
    "source": "bpipe",
    "url": url,
    "data": data
  };

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

};