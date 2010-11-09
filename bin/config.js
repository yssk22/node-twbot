#!/usr/bin/env node
var util = require('util');
var Twitter = require('../lib/twitter').Twitter;

var consumerKey = process.argv[2];
var consumerSecret = process.argv[3];
var client = new Twitter(consumerKey, consumerSecret);
client.getAccessToken(function(err, accessKey, accessSecret){
   if(err){
      throw err;
   }else{
      console.log('*********************************************************************');
      console.log('Access key/secret have been successfully retrieved from Twitter');
      console.log('You can use Bot application by following constructions.');
      console.log('*********************************************************************');
      console.log('');
      var config = {
         consumerKey: consumerKey,
         consumerSecret: consumerSecret,
         accessKey: accessKey,
         accessSecret: accessSecret
      };
      console.log('var TwBot = require("twbot").TwBot');
      console.log('var bot = new TwBot(' + JSON.stringify(config) + ')');
      process.exit(0);
   }
});
