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
                                      }).timeline;

module.exports = {
  "test home_timeline": function(){
    client.home_timeline(function(err, data){
      assert.isUndefined(err);
      assert.isNotNull(data);
    });
  }
}