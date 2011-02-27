var inspect = require('util').inspect;
exports.events = [];
exports.events.push(
   ['data', function(data){
      console.log(inspect(data));
   }]
);
