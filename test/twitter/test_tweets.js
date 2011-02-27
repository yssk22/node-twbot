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
                                      }).tweets;

module.exports = {
  "test show": function(){
    client.show(1472669360, function(err, data){
      assert.isUndefined(err);
      assert.isNotNull(data);
      assert.eql(data.id, 1472669360);
      assert.eql(data.text, "At least I can get your humor through tweets. RT @abdur: I don't mean this in a bad way, but genetically speaking your a cul-de-sac.");
    });
  },
  "test update": function(){
    var text = "This is a test: " + (new Date()).getTime();
    client.update(text, function(err, data){
      assert.isUndefined(err);
      assert.isNotNull(data);
      client.show(data.id_str, function(err, data){
        assert.isUndefined(err);
        assert.isNotNull(data);
        assert.eql(data.text, text);
      });
    });
  },
  "test destroy": function(){
    var text = "This is a test: " + (new Date()).getTime();
    client.update(text, function(err, data){
      var id = data.id_str;
      assert.isUndefined(err);
      assert.isNotNull(data);
      assert.eql(data.text, text);
      client.show(id, function(err, data){
        assert.isUndefined(err);
        assert.isNotNull(data);
        assert.eql(data.text, text);
        client.destroy(id, function(err, data){
          assert.isUndefined(err);
          assert.isNotNull(data);
          client.show(id, function(err, data){
            assert.isNotNull(err);
          });
        });
      });
    });
  }

}