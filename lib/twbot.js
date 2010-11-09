var EventEmitter = require('events').EventEmitter;
var util = require('util'),
    fs = require('fs');
var Twitter = require('./twitter').Twitter;

var emptyFun = function(){};
var NullLogger = {
   debug: emptyFun,
   error: emptyFun,
   warn: emptyFun,
   warning: emptyFun,
   critical: emptyFun,
   crit: emptyFun,
   info: emptyFun
};

DEFAULT_OPTIONS = {
   stopOnError : false
};

function TwBot(auth, options){
   if( typeof auth == 'string' ){
      auth = JSON.parse(fs.readFileSync(auth));
   }
   if( !options ){
      options = {};
   }
   this._client = new Twitter(auth.consumerKey, auth.consumerSecret,
                              {accessKey: auth.accessKey,
                               accessSecret: auth.accessSecret});
   // options
   for(var i in DEFAULT_OPTIONS){
      if( options[i] === undefined ){
         options[i] = DEFAULT_OPTIONS[i];
      }
   }
   this._options = options;
   this._account = null;
   this._plugins = {};
}
util.inherits(TwBot, EventEmitter);

TwBot.prototype.update = function(){
   var args = [];
   args.push.apply(args, arguments);
   this._delegateClient('update', 'updated', args);
};

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

TwBot.prototype.loadPlugin = function(/* arguments */){
   var self = this;
   [].slice.apply(arguments).forEach(function(path){
      var modpath = require.resolve(path);
      if( self._plugins[modpath] === undefined ){
         var mod = require(path);
         self._plugins[modpath] = mod;
         if( mod.events ){
            mod.events.forEach(function(elm){
               self.on(elm[0], elm[1]);
            });
         }
         if( mod.maches ){
            mod.maches.forEach(function(elm){
               self.matches(elm[0], elm[1]);
            });
         }
      }
   });
};

TwBot.prototype.startUserStream = function(params){
   var self = this;
   function _startUserStream(){
      var stream = self._client.openUserStream(params);
      stream.on('data', function(data){
         try{
            self._dispatchStreamEvent(data);
         }catch(e){
            console.error('dispatch event failure: ' + e);
            console.error(e.stack);
         }
      });
      stream.on('error', function(err){
         self.emit('error', err);
         if( !self._options.stopOnError ){
            setTimeout(self.startUserStream, 3000, params);
         }
      });
      stream.on('end', function(){
         setTimeout(self.startUserStream, 0, params);
      });
   }
   if( this._account == null ){
      this._client.getAccount(function(err, data){
         self._account = data;
         _startUserStream();
      });
   }else{
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


/**
 * @function delegate an method to the client, with event callback.
 *
 * @param fun method name of Twitter client
 * @param event event name
 * @param args arguments passed to fun.
 *
 */
TwBot.prototype._delegateClient = function(fun, event, args){
   var self = this;
   var client = self._client;
   function fireEvent(error, data, response){
      if( error ){
         self.emit('error', error, data, response);
      }else{
         self.emit(event, data, response);
      }
   }

   var last = args[args.length - 1];
   if( last !== undefined){
      // with args
      if( typeof last == 'function' ){
         args[args.length - 1] = function(error, data, response){
            last(error, data, response);
            fireEvent(error, data, response);
         };
      }else{
         args.push(fireEvent);
      }
   }else{
      // no args
      args = [fireEvent];
   }
   client[fun].apply(client, args);
};

TwBot.prototype.__defineGetter__('account', function(){
   return this._account;
});

TwBot.prototype.__defineGetter__('logger', function(){
   return this._logger || NullLogger;
});

TwBot.prototype.__defineSetter__('logger', function(val){
   this._logger = val;
});

exports.TwBot = TwBot;
