/**
 * Twitter Streaming bot module
 *
 * @author yssk22@gmail.com
 *
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util'),
    fs = require('fs');
var twitter = require('./twitter');

VERSION = '0.0.3';
DEFAULT_OPTIONS = {
  logger: 'twbot'
};

/**
 * Bot constructor. You can check how to pass the parameters to launch following command.
 *
 *    $ twbot:create {YourConsumerKey} {YourConsumerSecret}
 *
 * Options:
 *    - `logger` logger name.
 *
 * @param {Object|String} auth authorization parameter. String value is handled as JSON-formatted file path.
 * @param {Object} options
 *
 * @api public
 *
 */
function TwBot(auth, options){
  if( typeof auth == 'string' ){
    auth = JSON.parse(fs.readFileSync(auth));
  }
  // options
  if( !options ){
    options = {};
  }

  this._client = twitter.createClient(auth.consumerKey, auth.consumerSecret,
                                      {accessKey: auth.accessKey,
                                       accessSecret: auth.accessSecret,
                                       logger: options.logger});
  this._account = null;
  this._plugins = {};


  for(var i in DEFAULT_OPTIONS){
    if( options[i] === undefined ){
      options[i] = DEFAULT_OPTIONS[i];
    }
  }
  this._options = options;
  this._logger  = options.logger || require('log4js')().getLogger('twitter');
  this._version = VERSION;
}
util.inherits(TwBot, EventEmitter);

/**
 * Version #
 *
 * @return {String}
 * @api public
 */
TwBot.prototype.__defineGetter__('version', function(){
  return VERSION;
});

/**
 * Account object
 *
 * @return {Object}
 * @api public
 */
TwBot.prototype.__defineGetter__('account', function(){
  return this._account;
});

/**
 * Logger object
 *
 * @return {Object} log4js instance.
 * @api public
 */
TwBot.prototype.__defineGetter__('logger', function(){
  return this._logger;
});

/**
 * Twitter API client object
 *
 * @return {object} Twitter instance
 * @api public
 */
TwBot.prototype.__defineGetter__('client', function(){
  return this._client;
});

/**
 * Add conditional event listener for `status` event.
 *
 * Example:
 *
 *     # execute when status.text includes 'test'
 *     bot.match('test', function(status){
 *         console.log('matched');
 *     });
 *
 *     # execute when status.text matches /test/ig
 *     bot.match(/test/ig, function(status){
 *         console.log('matched');
 *     });
 *
 *     # execute when f(data.status) return true.
 *     function f(status){ ... };
 *     bot.match(f, function(status){
 *         console.log('matched');
 *     });
 *
 * @param {String|RegExp|Function} condition matched condition to be checked.
 * @param {Function} fun event listener function.
 * @api public
 *
 */
TwBot.prototype.match = function(condition, fun){
  var self = this;
  self.on('status', function(data){
    if( typeof condition == 'string' ){
      if( data.text.indexOf(condition) >= 0 ){
        fun(data);
      }
    }else if( typeof condition == 'function' ){
      if( condition.constructor.name == 'RegExp' ){
        if( data.text.match(condition) ){
          fun(data);
        }
      }else{
        if( condition(data) ){
          fun(data);
        }
      }
    }else{
      if( data.text.indexOf(condition.toString()) >= 0 ){
        fun(data);
      }
    }
  });
};

/**
 * Load the plugin
 *
 * @param {String} path plugin path string.
 * @param {Object} options parameters passed to plugin initializer.
 *
 */
TwBot.prototype.loadPlugin = function(path, options){
  var self = this;
  var modpath = require.resolve(path);
  if( self._plugins[modpath] === undefined ){
    var mod = require(path);
    self._plugins[modpath] = mod;
    if( mod.configure ){
      mod.configure.apply(self, [options]);
    }
    if( mod.events ){
      mod.events.forEach(function(elm){
        self.logger.info(modpath + ": event '" + elm[0] + "' loaded");
        self.on(elm[0], elm[1]);
      });
    }
    if( mod.maches ){
      mod.maches.forEach(function(elm){
        self.logger.info(modpath + ": match '" + elm[0] + "' loaded");
        self.matches(elm[0], elm[1]);
      });
    }
  }
};

TwBot.prototype.startUserStream = function(params, callback){
  var self = this;
  function _startUserStream(){
    var stream = self._client.stream.userStreams(params);
    // Event delegations.
    stream.on('data', function(data){
      try{
        self._dispatchStreamEvent(data);
      }catch(e){
        self.logger.error('dispatch event failure: ' + e);
        self.logger.error(e.stack);
      }
    });
    stream.on('error', function(err){
      self.logger.error('Something wrong in UserStream: ' + e);
      self.logger.error(e.stack);

      self.emit('error', err);
      if( !self._options.stopOnError ){
        self.logger.info('graceful restarting in 30 seconds');
        setTimeout(self.startUserStream, 3000, params);
      }else{
        self.logger.info('Stop the streaming on error.');
      }
    });
    stream.on('end', function(){
      self.logger.info('UserStream ends successfully. Reconnecting immediately...');
      setTimeout(self.startUserStream, 0, params);
    });
  }

  // before starting at first time, get the account data.
  if( this._account == null ){
    self.logger.info('UserStream starting ... ');
    self._client.account.verifyCredentials(function(err, data){
      if( !err ){
        self.logger.info('Account verified.: '  + data.name);
        self._account = data;
        _startUserStream();
        callback && callback(null, this);
      }else{
        self.logger.error(err);
        callback && callback((err instanceof Error) ? err : new Error(err));
      }
    });
  }else{
    // reconnecting
    self.logger.info('Reconnecting UserStream ... ');
    _startUserStream();
  }
};

TwBot.prototype._dispatchStreamEvent = function(data){
  var self = this;
  var argsList = this._getEventList(data);
  argsList.forEach(function(args){
    self.emit.apply(self, args);
  });
};

TwBot.prototype._getEventList = function(data){
  var argsList = [['data', data]];
  if(!data.event){
    if( data.friends ){
      argsList.push(['friendList', data.friends]);
    }
    if( data.text ){
      argsList.push(['status', data]);
      if( data.in_reply_to_user_id == this._account.id){
        argsList.push(['mentioned', data]);
      }
    }
    if( data.delete && data.status ){
      argsList.push(['statusDelete', data.status.id, data.status.user_id]);
    }
  }else{
    argsList.push([data.event, data.source, data.target]);
  }
  return argsList;
};

exports.TwBot = TwBot;