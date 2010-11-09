var vows = require('vows');
var assert = require('assert');
var suite = vows.describe('node-twbot/twbot test');
var TwBot = require('../lib/twbot').TwBot;

var MockStreamServer = require('./mock/stream').MockStreamServer;

suite.addBatch({
   'TwBot constructor' : {
      'with object' : {
         topic : {},
         'should be accepted.': function(topic){
            assert.ok(new TwBot(topic));
         }
      },
      'with filename' : {
         topic: __dirname + '/auth.json',
         'should be accepted.': function(topic){
            assert.ok(new TwBot(topic));
         }
      }
   },
   'TwBot Events': {
      'topic': function(){
         var server = new MockStreamServer(
            [{friends: [123456]}]
         );;
         server.listen(10080);
         // TODO event specification
      }
   },
   'TwBot logger' : {
      'topic': new TwBot({}),
      'should be changed from outside': function(bot){
         var log = [];
         assert.ok(bot.logger);
         assert.isFunction(bot.logger.info);
         bot.logger.info('foo');  // discarded

         bot.logger = {
            info: function(str){
               log.push(str);
            }
         };
         bot.logger.info('bar');
         assert.equal(log[log.length-1], 'bar');
      }
   }
}).export(module);

