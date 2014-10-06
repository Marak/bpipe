var debug = require('debug')('server')

module['exports'] = function bpipeStream (chunk, browsers, bpipes, data, stream) {
  
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
  debug('got data from bpipe client', data)
  debug('making new pipe', data.url)
  for (var browser in browsers) {
    if(browsers[browser].url === data.url || data.url === "default") {
      try {
        // TODO: there should be an event that is emitted when stream.write is no longer open
        debug('writing to ' + data.url, chunk)
        browsers[browser].stream.push(chunk.toString())
      } catch(err) {
        // browser stream is no longer there, delete it so we don't attempt to write again
        delete browsers[browser];
      }
    }
  }
};