/**
 * Timeline API implementation
 *
 * @author yssk22@gmail.com
 *
 * This module is used for index.js only.
 */
function tl(name){
  return function(params, callback){
    if( typeof params == 'function' ){
      callback = params;
      params = {};
    }
    var path = '/statuses/' + name + '.json';
    this.doGet(path, params, callback);
  };
}

module.exports = {
  /**
   * http://dev.twitter.com/doc/get/statuses/public_timeline
   */
  public_timeline  : tl('public_timeline'),
  /**
   * http://dev.twitter.com/doc/get/statuses/home_timeline
   */
  home_timeline    : tl('home_timeline'),
  /**
   * http://dev.twitter.com/doc/get/statuses/public_timeline
   */
  friends_timeline : tl('friends_timeline'),
  /**
   * http://dev.twitter.com/doc/get/statuses/user_timeline
   */
  user_timeline    : tl('user_timeline'),
  /**
   * http://dev.twitter.com/doc/get/statuses/mentions
   */
  mentions         : tl('mentions'),
  /**
   * http://dev.twitter.com/doc/get/statuses/retweeted_by_me
   */
  retweeted_by_me  : tl('retweeted_by_me'),
  /**
   * http://dev.twitter.com/doc/get/statuses/retweeted_to_me
   */
  retweeted_to_me  : tl('retweeted_to_me'),
  /**
   * http://dev.twitter.com/doc/get/statuses/retweeted_of_me
   */
  retweeted_of_me  : tl('retweeted_of_me')
}
