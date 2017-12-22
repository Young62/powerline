var session={

};

var ws;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Powerline');


game.state.add('boot',bootState);
game.state.add('load',loadState);
game.state.add('menu',menuState);
game.state.add('play',playState);
game.state.add('gameover',gameoverState);
game.state.add('connection',connectionState);

ws = new WebSocket('ws://104.15.79.139:40510');
//maw's:http://207.144.79.111:3000/
  //charles': http://104.15.79.139:3000/

// event emmited when connected
ws.onopen = function () {
    // sending a send event to websocket server
    ws.send(JSON.stringify({type:'connection'}))
};

ws.onclose=function(){
  //game.state.start('connection');
};

ws.onmessage = function (event) {
  var rec=JSON.parse(event.data);
  switch(rec.type){
    case "connected":
      console.log("Client ID: "+rec.clientID);
      session.clientID=rec.clientID;
      game.state.start('boot');
      break;
    default:
      console.log("Unknown message type recieved: " + rec.type);
      break;
  };
};
