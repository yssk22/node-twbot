/**
 * Pronounce the tweet using 'say' command.
 *
 * @author yssk22@gmail.com
 *
 */
var util   = require('util'),
    spawn  = require('child_process').spawn;
exports.events = [];
exports.events.push(
   ['status', function(data){
      var text = data.text;
      var say = spawn("say", ["-f", "-"]);
      say.stdin.write(text);
      say.stdin.end();
   }]
);

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
  bot.loadPlugin(__filename);
  bot.startUserStream();
}
