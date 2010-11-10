#!/usr/bin/env node
/**
 *
 * example: plugin usage
 *
 */
var TwBot = require('../lib/twbot').TwBot;
var bot = new TwBot({
   consumerKey: process.argv[2],
   consumerSecret: process.argv[3],
   accessKey: process.argv[4],
   accessSecret: process.argv[5]
});

// debug pluin dumps all data event to stderr.
bot.loadPlugin('../lib/plugins/debug');
bot.loadPlugin('../lib/plugins/say');
bot.startUserStream();
