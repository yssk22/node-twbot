/**
 * Twitter API wrapper module
 *
 * @author yssk22@gmail.com
 *
 */
var util = require('util'),
    url = require('url'),
    crypto = require('crypto'),
    http = require('http'),
    querystring = require('querystring'),
    EventEmitter = require('events').EventEmitter;
var OAuth = require('oauth').OAuth;
var normalizeError = require('../util').normalizeError;
var buildUrl = require('../util').buildUrl;
/**
 * OAuth Configuration constants
 */
var OAUTH_CONFIG = {
  RequestTokenUrl : "https://api.twitter.com/oauth/request_token",
  AccessTokenUrl  : "https://api.twitter.com/oauth/access_token",
  Version         : "1.0",
  Method          : "HMAC-SHA1"
};

/**
 * Twitter API endpoint URL
 */
var API_URL = "http://api.twitter.com/1";
/**
 * Twitter Streaming API endpoint URL
 */

/**
 * Twitter API Client
 *
 * @param consumerKey {String} consumerKey OAuth Consumer Key
 * @param consumerSecret {String} consumerSecret OAuth Consumer Secret
 * @param options {Object} API behavior options
 *
 */
function Twitter(consumerKey, consumerSecret, options){
  if( !options ){
    options = {};
  }
  this._oa = new OAuth(
    OAUTH_CONFIG.RequestTokenUrl,
    OAUTH_CONFIG.AccessTokenUrl,
    consumerKey,
    consumerSecret,
    OAUTH_CONFIG.Version,
    null,
    OAUTH_CONFIG.Method
  );
  this._accessKey = options.accessKey;
  this._accessSecret = options.accessSecret;

  this._logger = options.logger || require('log4js').getLogger('twitter');
};

exports.createClient = function(consumerKey, consumerSecret, options){
  var client = new Twitter(consumerKey, consumerSecret, options);
  var prototype = {
    connection: client,
    doGet: doGet(client),
    doPost: doPost(client)
  };

  function addModule(modname){
    var mod = require(__dirname + '/' + modname);
    var obj = Object.create(prototype);
    for(var i in mod){
      obj[i] = mod[i];
    }
    client[modname] = obj;
  }

  addModule('account');
  addModule('friendships');
  addModule('tweets');
  addModule('timeline');
  addModule('list');
  addModule('stream');

  // search API IF
  client.search = function(query, options, callback){
    if( typeof(options) == 'function' ){
      callback = options;
      options = {};
    }
    options.q = query;
    http.get({
      host: 'search.twitter.com',
      path: '/search.json?' + querystring.stringify(options)
    }, function(res){
      var data = '';
      res.on('data', function(chunk){
        data += chunk;
      });
      res.on('end', function(){
        var handler = createResponseHandler(callback);
        handler(null, data, res);
      });
    });
  };
  return client;
}


/**
 * Get the access token from twitter.
 * This method uses stdin for reading verification code.
 *
 * @param callback {Function} callback function after verification.
 *
 */
Twitter.prototype.getAccessToken = function(callback){
  var self = this;
  this._oa.getOAuthRequestToken(function(err, token, token_secret, results){
    if( err ){
      callback && callback(normalizeError(err));
    }else{
      var url = "http://twitter.com/oauth/authorize?oauth_token=" + token;
      var stdin = process.openStdin();
      stdin.setEncoding('utf8');
      process.stdout.write('please visit ' + url + ' to get verification code.\n');
      process.stdout.write('input verification code: ');
      stdin.on('data', function (chunk) {
        var verifier = chunk.split('\n')[0];
        self._oa.getOAuthAccessToken(
          token, token_secret, verifier,
          function(error, akey, asecret, results2){
            if(error){
              callback && callback(normalizeError(error));
            }else{
              self.accessKey = akey;
              self.accessSecret = asecret;
              callback && callback(null, akey, asecret);
            }
          }
        );
      });
    }
  });
};

function doGet(client){
  return function(path, params, callback){
    path = buildUrl(path, params);
    client._logger.debug('GET ' + path);
    var url = [API_URL, path].join('');
    client._oa.get(url, client._accessKey, client._accessSecret,
                   createResponseHandler(callback));
  };
}

function doPost(client){
  return function(path, body, callback){
    client._logger.debug('POST ' + path);
    client._logger.debug(">> " + util.inspect(body));
    var url = [API_URL, path].join('');
    client._oa.post(url, client._accessKey, client._accessSecret,
                    body,
                    createResponseHandler(callback));
  };
}

function createResponseHandler(callback){
  return function(error, data, response){
    if( error ){
      return callback && callback(normalizeError(error), data, response);
    }else{
      var obj = undefined;
      if( data ){
        try{
          obj = JSON.parse(data);
        }catch(e){
          obj = data;
          return callback(e, data, reponse);
        }
        return callback && callback(undefined, obj, response);
      }else{
        return callback && callback(undefined, data, response);
      }
    }
  };
};

exports.Twitter = Twitter;

