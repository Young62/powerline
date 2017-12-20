var loadState={
  preload:function(){
    game.load.image('loading','assets/loading.png');
    game.load.image('jkButton', 'assets/characters/jkButton.png');
    game.load.image('jarmyButton', 'assets/characters/jarmyButton.png');
    game.load.image('title', 'assets/title.png');
    game.load.image('background', 'assets/levels/background.png');

    //game.load.spritesheet('droid', 'assets/starstruck/droid.png', 32, 32);
    //game.load.image('starSmall', 'assets/starstruck/star.png');
    game.load.image('star', 'assets/starstruck/star2.png');

  },

  create: function(){
    var bg = game.add.tileSprite(0, 0, 800, 600, 'title');
    bg.fixedToCamera = true;
    var sprite=game.add.sprite(game.world.centerX,game.world.centerY,'loading');
    sprite.anchor.setTo(0.5,0.5);
    sprite.scale.setTo(-1,-1);
    game.add.tween(sprite).to( { angle: 765 }, 0, Phaser.Easing.Linear.None, true);
    game.add.tween(sprite.scale).to( { x: 1, y: 1 }, 3000, Phaser.Easing.Linear.None, true);
    var title=game.add.text(20, 60, 'Lugoff Legends:', {font: '50px Arial', fill: '#ff0000'});
    var subTitle=game.add.text(20, 120, 'Powerline', {font: '50px Arial', fill: '#ffcc00'});
    var startLabel=game.add.text(game.world.width-200, game.world.height-80, 'Click to Launch', {font: '25px Arial', fill: '#ffcc00'});

    game.input.onTap.addOnce(this.start, this);
  },

  start: function(){
    game.state.start('menu');
  }
}
