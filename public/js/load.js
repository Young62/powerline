var loadState={
  preload:function(){
    game.load.image('loading','assets/loading.png');

    game.load.tilemap('arena', 'assets/levels/arena.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/levels/tiles-1.png');
    game.load.spritesheet('dude', 'assets/starstruck/dude.png', 32, 48);
    game.load.spritesheet('droid', 'assets/starstruck/droid.png', 32, 32);
    game.load.image('starSmall', 'assets/starstruck/star.png');
    game.load.image('starBig', 'assets/starstruck/star2.png');
    game.load.image('background', 'assets/levels/background.png');
  },

  create: function(){
    var sprite=game.add.sprite(400,25,'loading');
    game.add.tween(sprite).to( { angle: 45 }, 2000, Phaser.Easing.Linear.None, true);
    game.add.tween(sprite.scale).to( { x: 2, y: 2 }, 2000, Phaser.Easing.Linear.None, true);
    game.stage.backgroundColor = '#182d3b';
    var title=game.add.text(0, 0, 'Lugoff Legends:', {font: '50px Arial', fill: '#ffffff'});
    var subTitle=game.add.text(0, 60, 'Powerline', {font: '50px Arial', fill: '#ffffff'});
    var startLabel=game.add.text(game.world.width-200, game.world.height-80, 'Click to Launch', {font: '25px Arial', fill: '#ffffff'});

    game.input.onTap.addOnce(this.start, this);
  },

  start: function(){
    game.state.start('menu');
  }
}
