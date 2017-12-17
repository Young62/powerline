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
    game.stage.backgroundColor = '#000000';
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;
    title=game.add.text(0, 0, 'Select Your Legend', {font: '50px Arial', fill: '#ffffff'});
    var jkButton = game.add.button(game.world.centerX - 400, 100, 'jkButton', selectLegend, this);
    jkButton.variable="jk";
    var jarmyButton = game.add.button(game.world.centerX + 100, 100, 'jarmyButton', selectLegend, this);
    jarmyButton.variable="jarmy";

    //game.input.onTap.addOnce(this.start, this);

    function selectLegend(input){
      var msg={
        type: "select",
        legend: input.variable
      };
      ws.send(JSON.stringify(msg));
    };

    ws.onmessage = function (event) {
      var rec=JSON.parse(event.data);
      switch(rec.type){
        case "selected":
          session.legend=rec.legend;
          game.state.start('play');
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

  update: function(){

  },

  disableButtons: function(){

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
