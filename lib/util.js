/**
 * Utility functions module
 *
 * @author yssk22@gmail.com
 *
 */
var querystring = require('querystring');

module.exports = {
  /**
   * Normalize the error as an Error object.
   *
   * @param err {Object} An object to be normalized
   *
   */
  normalizeError: function(err){
    if( err instanceof Error ){
      return err;
    }else if( err.statusCode ){
      // for 4XX/5XX error
      var e = new Error(err.statusCode + ': ' + err.data);
      e.statusCode = err.statusCode;
      try{
        e.data = JSON.parse(err.data);
      }catch(er){
        e.data = err.data;
      }
      return e;
    }else{
      // unknown error
      return new Error(e);
    }
  },

  /**
   * build the url with the specified path and params.
   *
   * @param path {String} the path string.
   * @param params {Object} (optional) the query parameter object.
   */
  buildUrl: function(path, params){
    var qs;
    if( typeof params == 'object' ){
      qs = querystring.stringify(params);
    }
    return qs ? path + "?" + qs : path;
  }
};
