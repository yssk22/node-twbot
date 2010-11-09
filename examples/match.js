#!/usr/bin/env node
/**
 *
 * example: condition triggerd bot
 *
 */
var cat = require('http').cat;
var TwBot = require('../lib/twbot').TwBot;
var bot = new TwBot({
   consumerKey: process.argv[2],
   consumerSecret: process.argv[3],
   accessKey: process.argv[4],
   accessSecret: process.argv[5]
});

bot.match(
   // condition string
   '#node-twbot',
   // trigger function executed only if tweet text includes the condition string.
   function(tweet){
      console.log(tweet.text);
   }
);

bot.match(
   // condition
   function(data){
      return data.entities.urls.length > 0;
   },
   // trigger function executed only if condition returns true.
   function(data){
      data.entities.urls.forEach(function(url){
         cat(url.url, function(err, content){
            if(err){
               console.err(err);
            }else{
               console.log(content);
            }
         });
      });
   }
);
bot.startUserStream();
