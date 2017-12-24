var storyState={
  preload:function(){

  },

  create:function(){
    this.story2();
  },

  story2: function(){
    game.stage.backgroundColor = '#000000';
    bg = game.add.tileSprite(0, 0, 800, 600, 'title');
    bg.fixedToCamera = true;
    title=game.add.text(0, 0, 'Hunter', {font: '50px Arial', fill: '#ffffff'});
    var sprite=game.add.sprite(100,game.world.centerY-100,'hunter');
    sprite.frame=0;
    sprite.anchor.setTo(0.5,0.5);
    sprite.scale.setTo(2,2);
    story=game.add.text(game.world.centerX-200, 100, 'It looks like I may have broken into an \nold cave. \n\nThis will be where I finally \nmake you fight for my amusement! \n\n Just dont make a mess \nor I will have to get involved.', {font: '30px Arial', fill: '#ffffff'});
    game.input.onTap.addOnce(this.start,this);
  },

  start: function(){
    game.state.start('play');
  }
}
