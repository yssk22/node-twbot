/**
 * Dump all data event to the console.
 *
 * @author yssk22@gmail.com
 *
 */
var inspect = require('util').inspect;
exports.events = [];
exports.events.push(
   ['data', function(data){
      console.log(inspect(data));
   }]
);
