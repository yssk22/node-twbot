This README is still under construction.

# node-twbot

This library provides the microframework to implement a twitter bot program.

## How to use

### OAuth Configuration

You need to get OAuth configuration before implementing your bot.

At first, use twbot:config command to generate oauth_token.

    $ twbot:config YOUR_CONSUMER_KEY YOUR_CONSUMER_SECRET
    The 'sys' module is now called 'util'. It should have a similar interface.
    please visit http://twitter.com/oauth/authorize?oauth_token=ZZZZZZZZZZZZZZZZZZZZ to get verification code.
    input verification code: XXXXXX

Then open your browser, go to authorize url, and input verification code.

    *********************************************************************
    Access key/secret have been successfully retrieved from Twitter
    You can use Bot application by following constructions.
    *********************************************************************
   
    var TwBot = require("twbot").TwBot;
    var bot = new TwBot({"consumerKey":"YOUR_CONSUMER_KEY","consumerSecret":"YOUR_CONSUMER_SECRET","accessKey":"YOUR_ACCESS_KEY","accessSecret":"YOUR_ACCESS_SECRET"})

You can use the above statement to initialize bot object.

### Implement Raw Events.

a bot instance is an EventEmitter instance. You can addListener/on function to define your event handers.

    bot.on('tweet', function(data){
        console.log(data.text);
    });

    bot.on('mentioned', function(data){
        console.log(data.text);
    });

### Implement Match Events

Focusing on tweet stream, you can use match function to trigger functions only when conditions are matched.

    bot.match(
      '#node-twbot',
      function(tweet){  // only executed when the tweet include #node-twbot hashtag.
         console.log(tweet.text);
      }
    );

The first argument accepts String or RegExp, which are compared with the tweet text. It also accept an function, which returns true to execute the handler.

### Starting event loop

A bot instance currently uses only UserStream API. To start

    bot.startUserStream();
    
To stop the bot, kill the process. If connection reset by Twitter server, it try to reconnect in several seconds.

## Examples

See more examples on the examples directory.

## Plugins

The plugins directory contains several useful implementations.

- auto-follow
- store-couchdb
- ... etc

To use plugins, just call the load method with plugin file path (require.paths is used to load).

    bot.loadPlugin('twbot/auto-follow');

You can implement your own plugin in your application.

# Lisense

MIT License


