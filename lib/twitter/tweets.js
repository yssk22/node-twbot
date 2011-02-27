/**
 * Status API implementation
 *
 * @author yssk22@gmail.com
 *
 * This module is used for index.js only.
 */

/**
 * Returns '/path/:id.json' type api functions
 */
function idFun(path, method){
  return function(id, params, callback){
    if( typeof params == 'function' ){
      callback = params;
      params = {};
    }
    switch(method.toUpperCase()){
    case "POST":
      return this.doPost(path + id + '.json', params, callback);
    case "GET":
      return this.doGet(path + id + '.json', params, callback);
    default:
      throw new TypeError('Bug: invalid method: ' + method);
    }
  };
}

module.exports = {
  /**
   * http://dev.twitter.com/doc/get/statuses/show/:id
   */
  show : idFun('/statuses/show/', 'GET'),

  /**
   * http://dev.twitter.com/doc/post/statuses/update
   *
   * params could be an string, which is treated as params.status.
   */
  update : function(params, callback){
    if( typeof params == 'string' ){
      params = {
        status: params
      };
    }
    if( params.status.length > 140 ){
      params.status = params.status.substr(0, 137) + "...";
    }
    return this.doPost('/statuses/update.json', params, callback);
  },

  /**
   * http://dev.twitter.com/doc/post/statuses/destroy/:id
   *
   */
  destroy : idFun('/statuses/destroy/', "POST"),

  /**
   * http://dev.twitter.com/doc/post/statuses/retweet/:id
   *
   */
  retweet: idFun('/statuses/retweet/', 'POST'),
  /**
   * http://dev.twitter.com/doc/post/statuses/retweets/:id
   *
   */
  retweets: idFun('/statuses/retweets/', "GET")
}
