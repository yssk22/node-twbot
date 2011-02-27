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
 *****/
  try{
    var cradle = require('cradle');
  }catch(e){
    console.error("You cannot use couchdb plugin.\n" +
                  "Please install cradle: '$ npm install cradle'");
  }

if( cralde ){
  exports.configure = function(options){
    if( !options ){
      options = {};
    };
    var connection;

    if( options.username == undefined ){
      connection = new cradle.Connection(options.host || "localhost",
                                         options.port || 5984);
    }else {
      connection = new cradle.Connection(options.host || "localhost",
                                         options.port || 5984,
                                         {
                                           secure: options.secure || false,
                                           auth: {
                                             username: options.username,
                                             password: options.password
                                           }
                                         });
    }
    this._couchdb = {
      connection: connection,
      database: connection.database(options.database),
      options: options
    };
  };

  var events = [];


  events.push(
    ['data', function(data){
      var bot = this;
      var database = bot._couchdb.database;
      var t = new Date();
      data.created_at = t;
      data.updated_at = t;
      db.save(data, function(err, res){
        if(err){
          bot.logger.error('couchdb plugin error: ' + e + "\n" + e.stack);
          bot.emit('couchdb:error', res);
        }else{
          bot.logger.debug('twitter data stored: ' + JSON.stringify(res));
          bot.emit('couchdb:stored', data, res);
        }
      });
    }]
  );
  exports.events = events;
}

