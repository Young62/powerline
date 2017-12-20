var session={

};

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Powerline');

game.state.add('boot',bootState);
game.state.add('load',loadState);
game.state.add('menu',menuState);
game.state.add('play',playState);
game.state.add('win',winState);

var ws = new WebSocket('ws://207.144.79.111:40510');
// event emmited when connected
ws.onopen = function () {
    // sending a send event to websocket server
    ws.send(JSON.stringify({type:'connection'}))
};

ws.onclose=function(){
  game.state.start('win');
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
