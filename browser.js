var ws = require('websocket-stream');
var through = require('through2');
var bpipes = {};

var dataplex = require('dataplex');
var domstream = require('domnode-dom');

var plex = dataplex();

// create connection to websocket server
var con = ws('ws://localhost:8001');
var stream = plex.open('/commands');

/*
var stream2 = plex.open('/foo');
stream2.on('error', function(err){
  console.log('stream2 error', err);
});
stream2.pipe(through(function(chunk, enc, file){
  console.log('got foo data');
}));
*/

con.pipe(plex).pipe(con);

stream.on('error', function(err){
  console.log('stream error', err);
});

con.on('error', function(err){
  console.log('con error', err);
});

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

    // if event is already bound, don't re-bind it
    // TODO: instead, delete it and re-bind
    if (typeof bpipes[selector] === "object") {
      return;
    }

    bpipes[selector] = { inputStream: inputStream };

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