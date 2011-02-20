var http = require('http');

// configurations
var port = 10080;
var fixtures = [
   {'friends': 203845594 },
   {'friends': 203845594 },
   {'friends': 203845594 },
   {'friends': 203845594 }
];


function MockStreamServer(fixtures){
   var self = this;
   this._fixtures = fixtures;
   this._server = http.createServer(function(req, res){
      res.writeHead(200, {'Content-Type': 'application/json'});
      self._stream(res, 0);
   });
}

MockStreamServer.prototype.listen = function(port){
   this._server.listen(port);
};

MockStreamServer.prototype.close = function(){
   this._server.close();
};

MockStreamServer.prototype._stream = function(res, index){
   if( index == this._fixtures.length ){
      res.end('\n');
   }else{
      var self = this;
      res.write(JSON.stringify(this._fixtures[index]) + "\n");
      setTimeout(function(){
         self._stream(res, index+1);
      }, 300);
   }
}

exports.MockStreamServer = MockStreamServer;
