var loadState={
  preload:function(){
    game.load.image('loading','assets/loading.png');
    game.load.image('title', 'assets/title.png');
    game.load.image('jkButton', 'assets/characters/jk/jkButton.png');
    game.load.image('jarmyButton', 'assets/characters/jarmy/jarmyButton.png');
    game.load.image('background', 'assets/levels/background.png');
    game.load.image('forest', 'assets/levels/forest.png');
    game.load.spritesheet('hunter', 'assets/characters/hunter/hunterSprites.png', 82,100);
    game.load.spritesheet('jarmy', 'assets/characters/jarmy/jarmySprites.png', 120,100);
    game.load.spritesheet('jk', 'assets/characters/jk/jkSprites.png', 110, 100);
    game.load.audio('breakingTheLaw', 'assets/mainTheme.ogg');
  },

  create: function(){
    music=game.add.audio('breakingTheLaw');
    music.play();
    //var bg = game.add.tileSprite(0, 0, 800, 600, 'title');
    //bg.fixedToCamera = true;
    var sprite=game.add.sprite(game.world.centerX,game.world.centerY,'loading');
    sprite.anchor.setTo(0.5,0.5);
    sprite.scale.setTo(-1,-1);
    game.add.tween(sprite).to( { angle: 765 }, 0, Phaser.Easing.Linear.None, true);
    game.add.tween(sprite.scale).to( { x: 1, y: 1 }, 3000, Phaser.Easing.Linear.None, true);
    //var title=game.add.text(20, 60, 'Lugoff Legends:', {font: '50px Arial', fill: '#ff0000'});
    //var subTitle=game.add.text(20, 120, 'Powerline', {font: '50px Arial', fill: '#ffcc00'});
    game.input.onTap.addOnce(this.start,this);
    game.time.events.add(3000,this.start,this);
  },

  start: function(){
    game.state.start('menu');
  }
}
