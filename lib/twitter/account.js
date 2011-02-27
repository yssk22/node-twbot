/**
 * Friendship API implementation
 *
 * @author yssk22@gmail.com
 *
 * This module is used for index.js only.
 */
module.exports = {
  verifyCredentials: function(params, callback){
    if(typeof params == 'function'){
      callback = params;
      params = {};
    }
    this.doGet('/account/verify_credentials.json', params, callback);
  }
}
