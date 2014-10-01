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
  //console.log('making new pipe', bpipes)
  
  // console.log('got data from bpipe client', data)
  for (var browser in browsers) {
    if(browsers[browser].url === data.url || data.url === "default") {
      try {
        // TODO: there should be an event that is emitted when stream.write is no longer open
        browsers[browser].stream.write(chunk.toString())
        debug('writing to ' + data.url)
      } catch(err) {
        // browser stream is no longer there, delete it so we don't attempt to write again
        //delete browsers[browser];
      }
    }
  }
  
};