var bodyParser=require('body-parser');
var express = require('express')
var ws = require('ws')
var app = express();
var path=require('path');

app.use(bodyParser.urlencoded({ extended:true  }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/style')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/js', express.static(path.join(__dirname, '/assets')));

app.get('/', function (req, res) {
   res.sendfile(__dirname + '/public/index.html');
});
app.listen(3000, function () {
   console.log('Powerline Server listening on port 3000:')
});

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510});


wss.on('connection', function (ws) {
  ws.on('message', function (event) {
    var msg=JSON.parse(event);
    switch(msg.type){
      case "connection":
        console.log("new connection");
        break;
      case "select":
        ws.send(msg.legend+" selected.");
        break;
    }

  });
});
