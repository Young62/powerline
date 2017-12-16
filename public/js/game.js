var ws = new WebSocket('ws://localhost:40510');
// event emmited when connected
ws.onopen = function () {
    console.log('websocket is connected ...')
    // sending a send event to websocket server
    ws.send(JSON.stringify({type:'connection'}))
};

// event emmited when receiving message
ws.onmessage = function (ev) {
    console.log(ev);
};


var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'Powerline');

game.state.add('boot',bootState);
game.state.add('load',loadState);
game.state.add('menu',menuState);
game.state.add('play',playState);
game.state.add('win',winState);

game.state.start('boot');
