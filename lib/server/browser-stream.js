var debug = require('debug')('server');

module['exports'] = function browserStream (chunk, browsers, bpipes, data, stream) {

    var _bpipe = bpipes[data.url];
    if (typeof _bpipe === "undefined") {
      _bpipe = bpipes['default'] || {};
    }

  // If an id has been sent, it means a new browser window is connecting for the first time
  if (typeof data.id !== "undefined") {

    debug('new browser being added', data.id)

    // Add the new browser ( and it's stream ) into browsers object
    browsers[data.id] = {
      stream: stream,
      url: data.url
    };

    // For every listening url in the bpipe, iterate through all selectors on that page
    for (var selector in _bpipe) {
      // For every selector found, there is a pipe waiting to be connected to the browser page
      // Send this event listener to the new browser page that just registered
      var send = {
        "selector": _bpipe[selector].selector,
        "event": _bpipe[selector].event,
        "source": "bpipe",
        "url": data.url
      };
      debug('trying to send out to browser', _bpipe, send)
      stream.write(JSON.stringify(send));
    }
  } else {
    // If no data.id is supplied, assume its the browser with event data,
    // send this data to the awaiting bpipe
    if (typeof _bpipe[data.selector] !== "undefined") {
      _bpipe[data.selector].stream.write(chunk.toString())
    }
  }

};