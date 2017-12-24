var music;
var cover;
var textColor;
var counter=0;
var title;
var subTitle;

var menuState={
  create:function(){
    this.story();
    ws.onmessage = function (event) {
      var rec=JSON.parse(event.data);
      switch(rec.type){
        case "selected":
          session.legend=rec.legend;
          game.state.start('story');
          break;
        case "selectedFailed":
          alert(rec.legend + " could not be selected.");
          break;
        default:
          console.log("Unusable message type recieved: " + rec.type);
          break;
      };
    };
  },

  story: function(){
    game.stage.backgroundColor = '#000000';
    title=game.add.text(0, 0, 'Hunter', {font: '50px Arial', fill: '#ffffff'});
    var sprite=game.add.sprite(100,game.world.centerY-100,'hunter');
    sprite.frame=0;
    sprite.anchor.setTo(0.5,0.5);
    sprite.scale.setTo(2,2);
    story=game.add.text(game.world.centerX-200, 100, 'Who is coming to look at what I found \n under my bunker \n on the \n POWERLINE?', {font: '30px Arial', fill: '#ffffff'});
    game.input.onTap.addOnce(this.characterSelect,this);
  },

  characterSelect: function(){
    game.stage.backgroundColor = '#000000';
    bg = game.add.tileSprite(0, 0, 800, 600, 'title');
    bg.fixedToCamera = true;
    title=game.add.text(0, 0, 'Select Your Legend', {font: '50px Arial', fill: '#ffffff'});
    var jkButton = game.add.button(0, 100, 'jkButton', selectLegend, this);
    jkButton.variable="jk";
    game.add.text(250, 200, 'JK', {font: '36px Arial', fill: '#ffffff'});
    game.add.text(250, 240, 'Happy and free-spirited, but make no mistake, you will not like it if this \ntinkerer pounds your ass...not like that. \n Press down while jumping to deliver a powerful buttslam.', {font: '16px Arial', fill: '#ffffff'});


    game.add.text(450, 450, 'Jarmy', {font: '36px Arial', fill: '#ffffff'});
    game.add.text(50, 490, 'Toughened from crawling around rock pits. His toughness is \ncomplimented by his lack of self-regard. \n Press down while walking left or right to unleash a fierce forward roll.', {font: '16px Arial', fill: '#ffffff'});
    var jarmyButton = game.add.button(500, 300, 'jarmyButton', selectLegend, this);
    jarmyButton.variable="jarmy";

    //game.input.onTap.addOnce(this.start, this);

    function selectLegend(input){
      var msg={
        type: "select",
        legend: input.variable
      };
      ws.send(JSON.stringify(msg));
    };
  },

  goFullScreen: function() {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    if (this.game.scale.isFullScreen) {
      this.game.scale.stopFullScreen();
    } else {
      this.game.scale.startFullScreen();
    }
  },

  start: function(){
    this.goFullScreen();
    game.state.start('play');
  }
}
