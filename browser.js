var ws = require('websocket-stream');
var through = require('through2');

// create connection to websocket server
var stream = ws('ws://localhost:8001');

stream.on('error', function(err){
  // console.log(err);
});

var domstream = require('domnode-dom');
var hello = {
  "source": "browser",
  "id": new Date().getTime(),
  "url": window.location.href
};
stream.write(new Buffer(JSON.stringify(hello)))

stream.on('data', function(x) { 

  // console.log('data from server', x.toString());

  var data = JSON.parse(x.toString());
  var selector = data.selector;

  if (typeof selector === "undefined" || selector.length === 0) {
    selector = "body";
  }

  // if there is no data, assume its a request to bind a new event listerer from bpipe
  if (typeof data.data === "undefined") {
    var inputElement =  document.querySelectorAll(selector)[0]; // TODO: forEach on the elements, instead of just acting on first matching element
    var inputStream = domstream.createEventStream(inputElement, data.event);
    // console.log('mapping new element', inputElement, selector)
    inputStream.pipe(through.obj(function(data, enc, cb){
      var data = {
        "selector": selector,
        "data": data,
        "source": "browser",
        "url": window.location.href
      };
      cb(null, JSON.stringify(data));
    }))
    .pipe(stream);
  } else {
    // data incoming from bpipe, send it to the browser
    var outputElement = document.querySelectorAll(selector)[0];
    var outputStream =  domstream.createWriteStream(outputElement, 'text/plain');
    // console.log('incoming data from bpipe', data, outputElement);
    outputStream.write(data.data);
  }
});