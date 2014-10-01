var debug = require('debug')('server');


module['exports'] = function browserStream (chunk, browsers, bpipes, data, stream) {
  
  // new browser connecting for the first time
  if (typeof data.id !== "undefined") {
    debug('new browser being added', data.id)
    browsers[data.id] = {
      stream: stream,
      url: data.url
    };
    // check to see if any streams are waiting for potential events
    for (var bpipe in bpipes) {
      for (var selector in bpipes[bpipe]) {
        // re-run all listening pipes on new browser
        // console.log(bpipes[bpipe])
        var send = {
          "selector": bpipes[bpipe][selector].selector,
          "event": bpipes[bpipe][selector].event,
          "source": "bpipe",
          "url": data.url
        };
        var found = false;
        if (bpipe === data.url) {
          found = true;
          debug('trying to send out to browser', bpipe, send)
          stream.write(JSON.stringify(send));
        }
      }
    }
    if(!found) {
      debug('trying to send out pre-existing event listeners', send)
      //console.log(bpipes, data)
      if (typeof bpipes['default'] !== "undefined") {
        for (var selector in bpipes['default']) {
          
          var send = {
            "selector": bpipes['default'][selector].selector,
            "event": bpipes['default'][selector].event,
            "source": "bpipe",
            "url": bpipes['default'][data.url]
          };
          console.log('trying to write to default browser', send)
          
          try {
            // TODO: there should be an event that is emitted when stream.write is no longer open
            bpipes['default'][selector].stream.write(JSON.stringify(send));
          } catch(err) {
            // browser stream is no longer there, delete it so we don't attempt to write again
            //delete bpipes['default'];
          }
          
        }
      }
    }
  }

  // then pipe the information back to bpipe connection waiting on that page and selector
  var found = false;
  if (typeof bpipes[data.url] !== 'undefined' && typeof bpipes[data.url][data.selector] !== "undefined") {
    found = true;
    bpipes[data.url][data.selector].stream.write(chunk.toString())
  }
  if (!found) {
    debug('trying to send out', 'default', send)
    //console.log(bpipes)
    
    if (typeof bpipes['default'] !== "undefined") {
      for (var selector in bpipes['default']) {
        console.log(data)
        bpipes['default'][selector].stream.write(chunk.toString());
      }
      
    }
  }
  
};