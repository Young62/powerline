var music;
var cover;
var textColor;
var counter=0;
var title;
var subTitle;

var menuState={
  create:function(){
    //music=game.add.audio('blackCoffee');
    //music.play();

    //cover=game.add.image(80,230,'cover');
    game.stage.backgroundColor = '#182d3b';
    title=game.add.text(0, 0, 'Select Your Legend', {font: '50px Arial', fill: '#ffffff'});
    var jkButton = game.add.button(game.world.centerX - 95, 400, 'button', selectLegend, this);
    jkButton.variable="jk";
    var jarmyButton = game.add.button(game.world.centerX + 95, 400, 'button', selectLegend, this);
    jarmyButton.variable="jarmy";

    //game.input.onTap.addOnce(this.start, this);

    function selectLegend(input){
      console.log(input.variable);
      var msg={
        type: "select",
        legend: input.variable
      };
      ws.send(JSON.stringify(msg));
    };
  },

  update: function(){

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
    //music.stop();
    //this.goFullScreen();
    game.state.start('play');
  }
}
