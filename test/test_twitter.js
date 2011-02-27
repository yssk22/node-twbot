var assert = require('assert');
var twitter = require('twitter');

try{
  var config = JSON.parse(require('fs').readFileSync(__dirname + '/auth.json'));
}catch(e){
  console.error('Please prepare test/auth.json for testing');
  process.exit(1);
}


module.exports = {
  "test twitter constructor": function(){
    var t = new twitter.Twitter(config.consumerKey, config.consumerSecret,
                                {
                                  accessKey: config.accessKey,
                                  accessSecret: config.accessSecret
                                });

    assert.isNotNull(t);
  }
}