/**
 * List API implementation
 *
 * @author yssk22@gmail.com
 *
 * This module is used for index.js only.
 */

module.exports = {
  /**
   * http://dev.twitter.com/doc/post/:user/lists
   */
  post: function(user, params, callback){
    if( typeof(params) == 'string' ){
      params = {
        name: params
      };
    }
    var name = params.name;
    delete(params.name);
    this.doPost(['', user, name].join('/') + '.json', params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/:user/lists
   */
  get: function(user, params, callback){
    if( typeof(params) == 'function'){
      callback = params;
      params = undefined;
    }
    this.doGet(['', user, 'lists'].join('/') + '.json', params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/:user/lists/:id/statuses
   */
  statuses: function(user, id, params, callback){
    if( typeof(params) == 'function'){
      callback = params;
      params = undefined;
    }
    this.doGet(['', user, 'lists', id, 'statuses'].join('/') + '.json', params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/:user/lists/memberships
   */
  memberships: function(user, params, callback){
    if( typeof(params) == 'function'){
      callback = params;
      params = undefined;
    }
    this.doGet(['', user, 'lists', 'memberships'].join('/') + '.json', params, callback);
  },

  /**
   * http://dev.twitter.com/doc/get/:user/lists/subscriptions
   */
  subscriptions: function(){
    if( typeof(params) == 'function'){
      callback = params;
      params = undefined;
    }
    this.doGet(['', user, 'lists', 'subscriptions'].join('/') + '.json', params, callback);
  }
}