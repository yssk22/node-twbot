/**
 * Streaming API implementation
 *
 * @author yssk22@gmail.com
 *
 * This module is used for index.js only.
 */

var EventEmitter = require('events').EventEmitter;
var logger = require('log4js')().getLogger('twitter');
var buildUrl = require('../util').buildUrl;

module.exports = {
  /**
   * http://dev.twitter.com/pages/user_streams
   */
  userStreams: function(params){
    var connection = this.connection;
    var uri = buildUrl('https://userstream.twitter.com/2/user.json', params);
    var request = connection._oa.get(uri, connection._accessKey, connection._accessSecret);
    return new UserStream(connection, request);
  }
}

function UserStream(connection, request){
  this._connection = connection;
  this._request = request;
  this._request.end();
  // Event Binding
  var self = this;
  function _dataReceived(jsonStr, response){
    if( jsonStr ){
      var obj = undefined;
      try{
        obj = JSON.parse(jsonStr);;
      }catch(e){
        // ignore invalid JSON string from twitter.
        logger.error('Twitter returns an invalid JSON String: ' + jsonStr);
      }
      if( obj ){
        logger.debug('<< ' + JSON.stringify(obj));
        self.emit('data', obj);
      }
    }
  }
  self._request.on('error', function(err){
    this.emit('error', err, undefined);
  });
  self._request.on('response', function(response){
    self._response = response;
    response.setEncoding('utf8');
    var isError = response.statusCode != 200;
    var buff = '';
    response.on('data', function(chunk){
      if( isError ){
        buff += chunk;
      }else{
        // valid stream started
        if( chunk.match(/\n/) ){
          // a line seperatator implies a data seperator.
          var chunks = chunk.split(/\r?\n/);
          var jsonStr = buff + chunks.shift(); // first chunk
          _dataReceived(jsonStr, response);
          if( chunks ){
            buff = chunks.pop(); // last chunk move back to buffer because it may be incomplete.
          }
          // all chunks are passed
          for(var i=0, len=chunks.length; i<len; i++){
            _dataReceived(chunks[i], response);
          }
        }else{
          buff += chunk;
        }
      }
    });
    response.on('end', function(){
      if( isError ){
        var error = new Error(response.statusCode + ': ' + buff);
        error.statusCode = response.statusCode;
        try{
          error.data = JSON.parse(buff);
        }catch(e){
          error.data = buff;
        }
        self.emit('error', error, response);
      }else{
        if( buff ){
          _dataReceived(buff);
        }
        self.emit('end');
      }
    });
  });
};
require('util').inherits(UserStream, EventEmitter);
UserStream.prototype.end = function(){
  var self = this;
  logger.info('close streaming...');
  var inspect = require('util').inspect;
  var http = require('http');
  console.log(inspect(http.getAgent('userstream.twitter.com', 80)));

  // TODO: this does not stop the event loop.
  // Connection state is 'FIN_WAIT_2', because twitter server does not send FIN packet to the client.
  // Node will keep monitoring of this state in the event loop.
  this._request.abort();
}

