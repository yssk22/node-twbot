/**
 * When the new follower is notified, the bot follow him/her.
 *
 * @author yssk22@gmail.com
 *
 */
var inspect = require('util').inspect;
exports.configure = function(options){
  if( !options ){
    options = {};
  }
  this._autoFollow = options;
}

var events = [];
events.push(
  ['data', function(data){
    if(data.event == 'follow'){
      console.log(inspect(data));
      var bot = this;
      bot.client.friendships.create({screen_name: data.source.screen_name}, function(err, result){
        if( err ){
          if( err.data && err.data.error ){
            bot.logger.warn(err.data.error);
          }else{
            bot.logger.error(inspect(err));
          }
        }else{
          bot.logger.info('AutoFollow: source = ' + data.source.screen_name + ')');
        }
      });
    }
  }]
);

exports.events = events;

// for manual testing
if(!module.parent){
  var TwBot = require('../twbot').TwBot;
  var bot = new TwBot({
    consumerKey    : process.argv[2],
    consumerSecret : process.argv[3],
    accessKey      : process.argv[4],
    accessSecret   : process.argv[5]
  });
  // debug pluin dumps all data event to stderr.
  bot.loadPlugin(__filename, {autoUnfollow: true});
  bot.startUserStream();
}
