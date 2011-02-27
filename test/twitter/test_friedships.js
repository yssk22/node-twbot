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
                                      }).friendships;

module.exports = {
  "test createAndDelete": function(){
    client.create({screen_name: 'yssk22_dev2'}, function(err, data){
      assert.isUndefined(err);
      assert.isNotNull(data);
      client.destroy({screen_name: 'yssk22_dev2'}, function(err, data){
        assert.isUndefined(err);
        assert.isNotNull(data);
      });
    });
  }
}