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
var attackCounter;
var attack;

var cursors;
var jumpButton;

//variables related to displaying the remote clients
var players=[];

var playState={
  preload: function(){
    game.load.tilemap('arena', 'assets/levels/arena.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/levels/tiles-1.png');

    switch(session.legend){
      case "jk":
        game.load.spritesheet('dude', 'assets/characters/wario.png', 66, 82);
        session.speed=75;
        session.jump=400;
        session.bounce=0.3;
        session.power=3;
        attack=function(p){
          if(!p.body.onFloor()){
            p.body.velocity.x=0;
            p.animations.play('thwomp');
            facing = 'idle';
            p.body.velocity.y = 500;
          }
        };
        break;
      case "jarmy":
        game.load.spritesheet('dude', 'assets/characters/wario.png', 66, 82);
        session.speed=150;
        session.jump=500;
        session.bounce=.2;
        session.power=2;
        attack=function(p){
          if(p.body.onFloor()===true && attackCounter<12){
            if(cursors.left.isDown){
              p.animations.play('thwomp');
              p.body.velocity.x=-500
              facing="left";
            }else if(cursors.right.isDown){
              p.animations.play('thwomp');
              p.body.velocity.x=500;
              facing="right";
            }else{
              isAttack=false;
            };
          };
        };
        break;
      default:
        break;
    };
  },

  create: function() {
      game.stage.backgroundColor = '#000000';
      bg = game.add.tileSprite(0, 0, 800, 600, 'background');
      bg.fixedToCamera = true;

      map = game.add.tilemap('arena');

      map.addTilesetImage('tiles-1');

      map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

      layer = map.createLayer('Tile Layer 1');

      //  Un-comment this on to see the collision tiles
      // layer.debug = true;

      layer.resizeWorld();

      game.physics.arcade.gravity.y = 500;

      //player
      player = game.add.sprite(0, 0, 'dude');
      game.physics.enable(player, Phaser.Physics.ARCADE);
      player.body.bounce.y = session.bounce;
      player.body.bounce.x = .2;
      player.body.collideWorldBounds = true;
      player.body.setSize(40, 64, 10, 16);
      player.animations.add('left', [0, 1, 2,3], 10, true);
      player.animations.add('turn', [2], 20, true);
      player.animations.add('right', [0, 1, 2,3], 10, true);
      player.animations.add('thwomp', [7], 20, true);
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
              if(session.clientID!==rec.players[i].clientID){
                if(i in players){
                  players[i].x=rec.players[i].x;
                  players[i].y=rec.players[i].y;
                }else{
                  players[i]=game.add.sprite(rec.players[i].x,rec.players[i].y,'star');
                }
              };
            };
            break;
        };
      };

  },

  update: function() {
    //local controls that broadcast state to server
    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;
    if(isAttack===true){
      attack(player);
      isAttack=false;
      attackCounter+=1;
    }else{
      attackCounter=0;
    }

    if(cursors.down.isDown){
      isAttack=true;
    }else  if (cursors.left.isDown){
      player.body.velocity.x = -session.speed;
      if (facing != 'left'){
        player.animations.play('left');
        facing = 'left';
      }
    }else if (cursors.right.isDown){
      player.body.velocity.x = session.speed;
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

    if (cursors.up.isDown && player.body.onFloor() && game.time.now > jumpTimer){
        player.body.velocity.y = -session.jump;
        jumpTimer = game.time.now + 750;
    };

    //update server
    session.x=player.body.x;
    session.y=player.body.y;
    session.isAttack=isAttack;
    var msg={
      type:"clientUpdate",
      clientID:session.clientID,
      session:session
    };
    ws.send(JSON.stringify(msg));
  }
}
