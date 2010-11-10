/**
 * CouchDB plugin
 *
 * This plugin provides a persisten function in your bot.
 *
 * bot.loadPlugin('plugins/couchdb', {
 *    port: 5984,
 *    host: 'localhost',
 *    username: 'admin',
 *    password: 'password',
 *    database: 'database'
 * });
 *
 * Your bot produces the 'couchdb:stored' event after this module is pluged in it.
 *
 */

var http = require('http');

exports.configure = function(options){
   var client, db;
   if( !options ){
      options = {};
   };
   if( !options.username ){
      client = http.createClient(options.port || 5984,
                                 options.host || "localhost");
   }else{
      client = http.createClient(options.port || 5984,
                                 options.host || "localhost",
                                 options.secure || false,
                                 options.username,
                                 options.password);
   }
   this._couchdb = {
      client: client,
      database: options.database
   };
};

var events = [];
events.push(
   ['data', function(data){
      var bot = this;
      var client = bot._couchdb.client;

      var t = new Date();
      data.created_at = t;
      data.updated_at = t;
      var content = JSON.stringify(data);
      var headers = {
         'content-type': 'application/json',
         'content-length': content.length
      };
      var path = ['', bot._couchdb.database, ''].join('/');
      var req = client.request('POST', path, headers);
      req.write(content);
      req.end();
      req.connection.on('error', function(err){
         bot.logger.error('couchdb plugin:' + e);
         bot.logger.error(e.stack);
         bot.emit('couchdb:error', e);
      });
      req.on('response', function(res){
         var body = '';
         res.on('data', function(chunk){
            body += chunk;
         });
         res.on('end', function(){
            var obj;
            try{
               obj = JSON.parse(body);
            }catch(e){
               bot.logger.error('couchdb plugin:' + e);
               bot.logger.error(e.stack);
               bot.emit('couchdb:error', e);
            }
            if( obj ){
               if( res.statusCode >= 300 ){
                  bot.logger.error('couchdb plugin: ' + obj.error + ' - ' + obj.reason);
                  bot.emit('couchdb:error', obj);
               }else{
                  bot.logger.info('couchdb stored: ' + path + obj.id);
                  bot.emit('couchdb:stored', obj, data);
               }
            }
         });
      });
   }]
);
exports.events = events;
