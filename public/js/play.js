//enviroment and background variables
var map;
var tileset;
var layer;
var bg;

//variables that relate to displaying and controlling local character
var player;
var facing = 'left';
var jumpTimer = 0;
var isAttack=false;
var isJump=false;
var attackTimer=0;
var attackCount=0;
var attackDuration=0;

var cursors;
var jumpButton;

//variables related to displaying the remote clients
var players=[];

//objects that represent the various character values
var jkAttributes={
  offsetX: 10,
  offsetY: 16,
  speed:75,
  jump:400,
  bounce:0.3,
  power:3,
  attack: function(p){
    if(!p.body.onFloor()){
      p.body.velocity.x=0;
      p.frame=4;
      p.body.velocity.y = 500;
    };
  }
};

var jarmyAttributes={
  offsetX: 10,
  offsetY: 16,
  speed:150,
  jump:450,
  bounce:0.2,
  power:2,
  attack: function(p){
    if(p.body.onFloor()===true){
      if(facing=="left"){
        p.frame=7;
        p.body.velocity.x=-300;
      }else if(facing=="right"){
        p.frame=7;
        p.body.velocity.x=300;
      };
    };
  }
};

var playState={
  preload: function(){
    game.load.tilemap('arena', 'assets/levels/arena.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/levels/tiles-1.png');
    game.load.spritesheet('jk', 'assets/characters/jkSprites.png', 66, 82);
    game.load.spritesheet('jarmy', 'assets/characters/jarmySprites.png', 66, 82);
  },

  create: function() {
      game.stage.backgroundColor = '#000000';
      bg = game.add.tileSprite(0, 0, 800, 600, 'background');
      bg.fixedToCamera = true;

      map = game.add.tilemap('arena');

      map.addTilesetImage('tiles-1');

      map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);

      layer = map.createLayer('Tile Layer 1');

      //  Un-comment this on to see the collision tiles
      // layer.debug = true;

      layer.resizeWorld();

      game.physics.arcade.gravity.y = 500;

      //player
      switch(session.legend){
        case "jk":
          session.attributes=jkAttributes;
          break;
        case "jarmy":
          session.attributes=jarmyAttributes;
          break;
        default:
          break;
      };
      player = game.add.sprite(0, 0, session.legend);
      game.physics.enable(player, Phaser.Physics.ARCADE);
      player.body.bounce.y = session.attributes.bounce;
      player.body.bounce.x = .2;
      player.body.collideWorldBounds = true;
      player.body.setSize(40, 64, session.attributes.offsetX, session.attributes.offsetY);
      player.animations.add('left', [0, 1, 2,3], 10, true);
      player.animations.add('turn', [2], 20, true);
      player.animations.add('right', [0, 1, 2,3], 10, true);
      game.camera.follow(player);
      session.x=player.body.x;
      session.y=player.body.y;
      msg={
        type:"newPlayer",
        clientID: session.clientID,
        session: session
      };
      ws.send(JSON.stringify(msg));


      cursors = game.input.keyboard.createCursorKeys();
      jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      ws.onmessage=function(){
        var rec=JSON.parse(event.data);
        switch(rec.type){
          case "update":
            for(var i in rec.players){
              if((typeof rec.players[i] !=='undefined') && session.clientID!==rec.players[i].clientID){
                if(players.hasOwnProperty(rec.players[i].clientID)){
                  players[rec.players[i].clientID].sprite.x=rec.players[i].x-players[rec.players[i].clientID].attributes.offsetX;
                  players[rec.players[i].clientID].sprite.y=rec.players[i].y-players[rec.players[i].clientID].attributes.offsetY;

                  //remote player animation
                  if(rec.players[i].isAttack==true){
                    players[rec.players[i].clientID].sprite.frame=5;
                  }else if(rec.players[i].facing=='left'){
                    players[rec.players[i].clientID].sprite.frame=0;
                  }else if(rec.players[i].facing=='right'){
                    players[rec.players[i].clientID].sprite.frame=3;
                  }else{
                    players[rec.players[i].clientID].sprite.frame=3;
                  }

                }else if(typeof rec.players[i].clientID !=='undefined'){
                  players[rec.players[i].clientID]=[]
                  switch(rec.players[i].legend){
                    case "jk":
                      players[rec.players[i].clientID].attributes=jkAttributes;
                      break;
                    case "jarmy":
                      players[rec.players[i].clientID].attributes=jarmyAttributes;
                      break;
                    default:
                      break;
                  };
                  players[rec.players[i].clientID].sprite=game.add.sprite(rec.players[i].x-players[rec.players[i].clientID].attributes.offsetX,rec.players[i].y-players[rec.players[i].clientID].attributes.offsetY,rec.players[i].legend);
                  game.physics.enable(players[rec.players[i].clientID].sprite, Phaser.Physics.ARCADE);
                  players[rec.players[i].clientID].sprite.body.allowGravity=false;
                  players[rec.players[i].clientID].sprite.body.collideWorldBounds = true;
                  players[rec.players[i].clientID].sprite.body.bounce.setTo(1, 1);
                  //players[rec.players[i].clientID].sprite.spriteanimations.add('left', [0, 1, 2,3], 10, true);
                  //players[rec.players[i].clientID].sprite.spriteanimations.add('turn', [2], 20, true);
                  //players[rec.players[i].clientID].sprite.spriteanimations.add('right', [0, 1, 2,3], 10, true);
                }else{
                  console.log("Undefinited player object present.");
                };
              };
            };
            break;
        };
      };

  },

  update: function() {
    //local controls that broadcast state to server
    game.physics.arcade.collide(player, layer);
    for(var i in players){
      if(checkOverlap(player, players[i].sprite))console.log("true");
    }

    player.body.velocity.x = 0;

    if(cursors.down.isDown){
      session.attributes.attack(player);
      isAttack=true;
    }else{
      isAttack=false;
      if (cursors.left.isDown){
        player.body.velocity.x = -session.attributes.speed;
        if (facing != 'left'){
          player.animations.play('left');
          facing = 'left';
        }
      }else if (cursors.right.isDown){
        player.body.velocity.x = session.attributes.speed;
        if (facing != 'right'){
          player.animations.play('right');
          facing = 'right';
        }
      }else{
        if (facing != 'idle'){
          player.animations.stop();
          if (facing == 'left'){
              player.frame = 0;
          }else{
              player.frame = 3;
          }
          facing = 'idle';
        }
      };
    };

    if (cursors.up.isDown && player.body.onFloor() && game.time.now > jumpTimer){
      player.body.velocity.y = -session.attributes.jump;
      jumpTimer = game.time.now + 750;
      isJump=true;
    }else{
      isJump=false;
    };

    sendUpdate();

    function checkOverlap(spriteA, spriteB){
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();

      return Phaser.Rectangle.intersects(boundsA, boundsB);
    };

    //update server
    function sendUpdate(){
      session.x=player.body.x;
      session.y=player.body.y;
      session.facing=facing;
      session.isAttack=isAttack;
      session.isJump=isJump;
      var msg={
        type:"clientUpdate",
        clientID:session.clientID,
        session:session
      };
      ws.send(JSON.stringify(msg));
    };
  }
}
