/**
 * Friendship API implementation
 *
 * @author yssk22@gmail.com
 *
 * This module is used for index.js only.
 */

function uidFun(path){
  return function(uid, params, callback){
    if( typeof params == "string" ){
      params = {
        user_id: params
      };
    }
    this.doPost(path, params, callback);
  };
}

module.exports = {
  /**
   * http://dev.twitter.com/doc/get/friendships/create
   */
  create: uidFun("/friendships/create.json"),
  /**
   * http://dev.twitter.com/doc/get/friendships/delete
   */
  delete: uidFun("/friendships/delete.json"),

  /**
   * http://dev.twitter.com/doc/get/friendships/show
   */
  show: function(params, callback){
    this.doGet("/friendships/show.json", params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/friendships/exists
   */
  exists: function(params, callback){
    this.doGet("/friendships/exists.json", params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/friendships/incoming
   */
  incoming: function(params, callback){
    this.doGet("/friendships/incoming.json", params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/friendships/outgoing
   */
  outgoing: function(params, callback){
    this.doGet("/friendships/outgoing.json", params, callback);
  }
}