var assert = require('assert');
var twitter = require('twitter');

try{
  var config = JSON.parse(require('fs').readFileSync(__dirname + '/../auth.json'));
}catch(e){
  console.error('Please prepare test/auth.json for testing');
  process.exit(1);
}

var client = new twitter.createClient(config.consumerKey, config.consumerSecret,
                                      {
                                        accessKey: config.accessKey,
                                        accessSecret: config.accessSecret
                                      }).stream;

module.exports = {
  "test userStreams": function(){
    var stream = client.userStreams();
    stream.on('data', function(data){
      console.log(require('util').inspect(data));
      assert.isNotNull(data);
      stream.end();
    });
  }
}
