var server = require('../lib/server');

server.start({ port: 8001 }, function (err, server){
  if (err) {
    console.error(err);
    return;
  }
  server.on('wsconnection', function (stream){
    console.log('got ws connection');
    stream.plex.add('/querySelector', require('../lib/pipes/querySelector/server')());
  });
  console.log('bpipe ws server started on port ' + server.address().port);
});
