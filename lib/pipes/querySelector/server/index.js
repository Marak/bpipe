var through = require('through2');
var debug = require('debug')('server');

var handleBrowser = require('./browser');
var handleBpipe = require('./bpipe');

var bpipes = {};
var browsers = {};

module['exports'] = function domSelectors () {
  return function (opts) {
    return through(function (chunk, enc, next) {
       var _stream = this;
       debug('getting data from stream', chunk.toString())
       var data = JSON.parse(chunk.toString('utf8'));
       data.url = data.url || "default";
       if (data.source === "browser") {
         // data is coming in from the browser
          handleBrowser(chunk, browsers, bpipes, data, _stream);
       } else {
         // data is coming from the bpipe client, not the browser
          handleBpipe(chunk, browsers, bpipes, data, _stream);
       }
       next();
     });
  };
};