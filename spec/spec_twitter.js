var assert = require('assert'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');
var vows = require('vows');
var Twitter = require('../lib/twitter').Twitter;
var auth = JSON.parse(fs.readFileSync(__dirname + '/auth.json'));

var MockStreamServer = require('./mock/stream').MockStreamServer;
function ts(){
   return ((new Date()).getTime());
}

vows.describe('node-twbot/twitter api test')
   .addBatch({
      'Twitter Client' : {
         'topic' : function(){
            var client = new Twitter(auth.consumerKey, auth.consumerSecret,
                                     {streamUrl: 'http://localhost:10080'});
            client.accessKey = auth.accessKey;
            client.accessSecret = auth.accessSecret;
            return client;
         },
         'when updates a text.' : {
            'topic': function(client){
               var text = ts() + ': test tweet';
               client.update(text, this.callback);
            },
            'should returns a tweet object' : function(err, data, response){
               assert.isNull(err);
               assert.isObject(data);
               assert.isObject(data.user);
               assert.ok(data.text);
            }
         },
         'when updates a text over 140 chars' : {
            'topic' : function(client){
               var text = ts().toString();
               var padding = 140 - text.length;
               for(var i=0; i<padding; i++){
                  text = text + '*';
               }
               text += "this is truncated.";
               client.update(text, this.callback);
            },
            'should truncate the text' : function(err, data, response){
               assert.isNull(err);
               assert.isObject(data);
               assert.isObject(data.user);
               assert.ok(data.text);
               assert.equal(data.text.length, 140);
               assert.equal(data.text.substr(137), '...');
            }
         },
         'when gets timeline' : {
            'without parameters' : {
               'topic': function(client){
                  client.getTimeline(this.callback);
               },
               'should returns home timeline' : function(err, data, response){
                  // TODO: how to test the data is 'home' or not.
                  assert.isNull(err);
                  assert.isArray(data);
               }
            },
            'with string parameters' : {
               'topic': function(client){
                  client.getTimeline('public', this.callback);
               },
               'should returns the specified timeline' : function(err, data, response){
                  // TODO: how to test the data is specified timeline or not.
                  assert.isNull(err);
                  assert.isArray(data);
               }
            },
            'with parameters' : {
               'topic': function(client){
                  client.getTimeline({
                     type: 'user',
                     user: 'yssk22'
                  }, this.callback);
               },
               'should returns the specified timeline' : function(err, data, response){
                  // TODO: how to test the data is specified timeline or not.
                  assert.isNull(err);
                  assert.isArray(data);
               }
            },
            'with wrong parameter' : {
               'topic': function(client){
                  client.getTimeline({
                     type: 'user',
                     user: 'nonexistent'
                  }, this.callback);
               },
               'should returns an error' : function(err, data, response){
                  assert.isObject(err);
                  assert.isUndefined(data);
               }
            }
         }
      },
      'UserStream' : {
         'topic': function(){
            var server = new MockStreamServer(
               [{friends: [123456]}]
            );;
            server.listen(10080);

            var client = new Twitter(auth.consumerKey, auth.consumerSecret,
                                     {streamUrl: 'http://localhost:10080'});
            client.accessKey = auth.accessKey;
            client.accessSecret = auth.accessSecret;
            return {
               client: client,
               stream: client.openUserStream(),
               server: server
            };
         },
         'events' : {
            'topic': function(topic){
               var client = topic.client;
               var server = topic.server;
               var stream = topic.stream;
               var self = this;
               var result = {};
               stream.on('data', function(data){
                  if( !result.received ){
                     result.received = [];
                  }
                  result.received.push(data);
               });
               stream.on('error', function(err){
                  self.callback(err);
               });
               stream.on('end', function(){
                  result.end = true;
                  self.callback(null, result);
               });
            },
            'should have end event': function(result){
               assert.ok(result.end);
            },
            'should receive streamed data' : function(result){
               assert.isArray(result.received);
               assert.length(result.received, 1);
            },
            'teardown': function(_, topic){
               topic.stream.end();
               topic.server.close();
            }
         }
      }
   }).export(module);
