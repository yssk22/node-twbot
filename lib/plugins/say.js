var util   = require('util'),
    spawn  = require('child_process').spawn;
exports.events = [];
exports.events.push(
   ['status', function(data){
      var text = data.text;
      var say = spawn("say", ["-f", "-"]);
      say.stdin.write(text);
      say.stdin.end();
   }]
);
