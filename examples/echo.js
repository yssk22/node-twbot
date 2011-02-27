#!/usr/bin/env node
/**
 *
 * example: echo bot
 *
 */
var TwBot = require('../lib/twbot').TwBot;
var bot = new TwBot({
   consumerKey: process.argv[2],
   consumerSecret: process.argv[3],
   accessKey: process.argv[4],
   accessSecret: process.argv[5]
});

bot.on('data', function(data){
   console.log(require('util').inspect(data));
});

bot.on('mentioned', function(tweet){
   var text = tweet.text.substr(bot.account.screen_name.length + 1);
   bot.update("@" + tweet.user.screen_name + " " + text);
});
bot.startUserStream();
