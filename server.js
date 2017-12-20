//html server and variables
///////////////////////////
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

//websocket and game, server and variables
//////////////////////////////////////////
var clientID=0;
var clients=[];
var legendsSelected=[];
var players=[];

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510});

wss.on('connection', function (ws) {
  ws.on('message', function (event) {
    var rec=JSON.parse(event);
    switch(rec.type){
      case "connection":
        console.log("Client " + clientID + " connected");
        var msg={
          type:"connected",
          clientID: clientID
        };
        clientID+=1;
        ws.send(JSON.stringify(msg));
        break;
      case "select":
        if(legendsSelected.indexOf(rec.legend)===-1){
          console.log(rec.legend + " was selected");
          var msg={
            type: "selected",
            legend: rec.legend
          };
          legendsSelected.push(rec.legend);
          ws.send(JSON.stringify(msg));
        }else{
          console.log(rec.legend + " was not able to be selected.");
          var msg={
            type: "selectedFailed",
            legend: rec.legend
          };
          ws.send(JSON.stringify(msg));
        }
        break;
      case "newPlayer":
        console.log("Client " + rec.clientID + " has entered the game as " +rec.session.legend);
        players[rec.clientID]=rec.session;
        break;
      case "clientUpdate":
        players[rec.clientID]=rec.session;
        break;
      default:
        console.log("Unknown message type recieved: " + rec.type);
        break;
    }

  });
});

//update game state
setInterval(function(){
  var msg={
    type:"update",
    players: players
  };
  broadcast(JSON.stringify(msg));
}, 10);

function broadcast(msg) {
   //console.log(msg);
   wss.clients.forEach(function each(client) {
       client.send(msg);
    });
};
