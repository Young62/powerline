//enviroment and background variables
var map;
var tileset;
var layer;
var bg;
var hunter;
var healthbar;

//variables that relate to displaying and controlling local character
var player;
var facing = 'right';
var jumpTimer = 0;
var attackTimer=0;
var attackCount=0;
var attackDuration=0;

var cursors;
var jumpButton;

//variables related to displaying the remote clients
var players=[];
var leader={
  health:0
};
var oldTheme='';

//objects that represent the various character values
var jkAttributes={
  width: 40,
  height: 80,
  offsetX: 20,
  offsetY: 10,
  speed:75,
  jump:450,
  bounceY:0.3,
  bounceY:0.3,
  health:1500,
  theme: 'jkTheme',
  power:3,
  attack: function(p){
    if(!p.body.onFloor() && game.time.now < attackTimer){
      p.body.velocity.x=0;
      p.frame=4;
      p.body.velocity.y = 500;
      session.isAttack=true;
      player.frame=7;
    }else if(game.time.now>attackTimer+300){
      attackTimer=game.time.now+200;
      player.frame=6;
    }else{
      p.body.velocity.y=-275;
      player.frame=6;
    };
  }
};

var jarmyAttributes={
  width: 40,
  height: 80,
  offsetX: 20,
  offsetY: 10,
  speed:150,
  jump:400,
  bounceX:1,
  bounceY:0.2,
  health:1500,
  theme: 'jarmyTheme',
  power:2,
  attack: function(p){
    if(p.body.onFloor()===true){

      if(facing=="left"){
        if(session.isAttack===false){
          player.animations.play('attack');
        };
        p.body.velocity.x=-400;
        session.isAttack=true;
      }else if(facing=="right"){
        if(session.isAttack===false){
          player.animations.play('attack');
        };
        p.body.velocity.x=400;
        session.isAttack=true;
      }else{
        session.isAttack=false;
        facing="idle";
      };
    };
  }
};

var playState={
  preload: function(){
    game.load.tilemap('arena', 'assets/levels/arena.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'assets/levels/tiles-1.png');
    game.load.audio('jkTheme', 'assets/characters/jk/theme.ogg');
    game.load.audio('jarmyTheme', 'assets/characters/jarmy/theme.ogg');
  },

  create: function() {
      game.stage.backgroundColor = '#996600';
      bg1 = game.add.tileSprite(0, 0, 1200, 100, 'forest');
      bg2 = game.add.tileSprite(0, 200, 1200, 600, 'background');
      bg.fixedToCamera = false;

      map = game.add.tilemap('arena');

      map.addTilesetImage('tiles-1');

      map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);

      layer = map.createLayer('Tile Layer 1');

      //  Un-comment this on to see the collision tiles
      // layer.debug = true;

      layer.resizeWorld();

      game.physics.arcade.gravity.y = 500;

      hunter=game.add.sprite(650, -0, 'hunter');
      game.physics.enable(hunter, Phaser.Physics.ARCADE);
      hunter.body.setSize(30, 90, 25, 0);
      hunter.body.collideWorldBounds = true;

      //player construction
      /////////////////////
      player = game.add.sprite(500, 0, session.legend);
      game.physics.enable(player, Phaser.Physics.ARCADE);
      player.animations.add('left', [0, 1, 2], 3, true);
      player.animations.add('right', [3,4,5], 3, true);
      player.animations.add('attack', [6,7,8,9], 3, true);
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
      player.body.bounce.y = session.attributes.bounceY;
      player.body.bounce.x = session.attributes.bounceX;
      player.body.collideWorldBounds = true;
      player.body.setSize(session.attributes.width, session.attributes.height, session.attributes.offsetX, session.attributes.offsetY);
      game.camera.follow(player);

      session.x=player.body.x;
      session.y=player.body.y;
      session.health=session.attributes.health;
      player.maxHealth = session.attributes.health;

      //player health bar
      var label=game.add.text(0,5,"+",{font:'bold 18px Arial', fill:'red'});
      label.fixedToCamera=true;
      playerHealthMeter = this.game.add.plugin(Phaser.Plugin.HealthMeter);
      playerHealthMeter.bar(
          player,
          {x: 12, y: 5,
            width: 200, height: 20,
            foreground: '#00ff00',
            background: '#ff0000',
            alpha: 0.6
          }
      );

      var msg={
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
              if(rec.players[i] !==null && (rec.players[i].isDead===true || rec.players[i].isActive===false)){
                try{
                  players[rec.players[i].clientID].sprite.destroy();
                  players[rec.players[i].clientID].healthBar.kill();
                  delete players[rec.players[i].clientID];
                }catch(e){

                };
              }else if(rec.players[i]!==null && session.clientID!==rec.players[i].clientID){
                if(players.hasOwnProperty(rec.players[i].clientID)){
                  //remote player movement
                  players[rec.players[i].clientID].sprite.x=rec.players[i].x;
                  players[rec.players[i].clientID].sprite.y=rec.players[i].y;
                  players[rec.players[i].clientID].healthBar.setPosition(rec.players[i].x+3*(players[rec.players[i].clientID].attributes.offsetX), rec.players[i].y-15);
                  players[rec.players[i].clientID].healthBar.setPercent(((rec.players[i].health/rec.players[i].attributes.health)*100));

                  //remote player animation
                  if(rec.players[i].isAttack===true){
                    if(checkOverlap(player, players[rec.players[i].clientID].sprite)){
                      session.health-=players[rec.players[i].clientID].attributes.power;
                      if(session.health<=0){
                        session.isDead=true;
                        var msg={
                          type:"clientUpdate",
                          clientID:session.clientID,
                          session:session
                        };
                        ws.send(JSON.stringify(msg));
                        player.destroy();
                        game.state.start('gameover');
                      };

                      if(players[rec.players[i].clientID].isAttack!==true){
                        players[rec.players[i].clientID].sprite.animations.play("attack");
                        players[rec.players[i].clientID].isAttack=true;
                      }
                    };
                  }else if(rec.players[i].facing==='left'){
                    if(players[rec.players[i].clientID].facing!=='left'){
                      players[rec.players[i].clientID].sprite.animations.play("left");
                      players[rec.players[i].clientID].facing='left';
                    };
                  }else if(rec.players[i].facing==='right'){
                    if(players[rec.players[i].clientID].facing!=='right'){
                      players[rec.players[i].clientID].sprite.animations.play("right");
                      players[rec.players[i].clientID].facing='right';
                    };
                  }else{
                    if (rec.players[i].facing != 'idle'){
                      player.animations.stop();
                      if (facing=='left'){
                          players[rec.players[i].clientID].sprite.frame=0;
                      }else{
                        players[rec.players[i].clientID].sprite.frame=3;
                      }
                      facing='idle';
                    }
                  };
                }else if(typeof rec.players[i].clientID !=='undefined'){
                  players[rec.players[i].clientID]=[];
                  switch(rec.players[i].legend){
                    case "jk":
                      players[rec.players[i].clientID].attributes=jkAttributes;
                      break;
                    case "jarmy":
                      players[rec.players[i].clientID].attributes=jarmyAttributes;
                      //players[rec.players[i].clientID].sprite.animations.add('attack', [6, 7, 8, 9], 3, true);
                      break;
                    default:
                      break;
                  };
                  players[rec.players[i].clientID].sprite=game.add.sprite(rec.players[i].x,rec.players[i].y,rec.players[i].legend);
                  game.physics.enable(players[rec.players[i].clientID].sprite, Phaser.Physics.ARCADE);
                  players[rec.players[i].clientID].sprite.body.setSize(players[rec.players[i].clientID].attributes.width, players[rec.players[i].clientID].attributes.height, players[rec.players[i].clientID].attributes.offsetX, players[rec.players[i].clientID].attributes.offsetY);
                  players[rec.players[i].clientID].sprite.animations.add('left', [0, 1, 2], 3, true);
                  players[rec.players[i].clientID].sprite.animations.add('right', [3, 4, 5], 3, true);
                  players[rec.players[i].clientID].sprite.animations.add('attack', [6, 7], 3, true);
                  players[rec.players[i].clientID].sprite.body.allowGravity=false;
                  players[rec.players[i].clientID].sprite.body.immovable=true;
                  players[rec.players[i].clientID].sprite.body.moves=false;
                  players[rec.players[i].clientID].sprite.body.collideWorldBounds = true;
                  players[rec.players[i].clientID].sprite.body.checkCollision.up = false;
                  players[rec.players[i].clientID].sprite.body.bounce.setTo(1, 1);
                  players[rec.players[i].clientID].sprite.maxHealth = players[rec.players[i].clientID].attributes.health;
                  players[rec.players[i].clientID].healthBar = new HealthBar(game, {x:players[rec.players[i].clientID].sprite.x, y:players[rec.players[i].clientID].sprite.y-15});
                  players[rec.players[i].clientID].facing='idle';
                  players[rec.players[i].clientID].isAttack='false';
                  players[rec.players[i].clientID].sprite.frame=0;
                }else{
                  console.log("Undefined player object present.");
                };
              };
            };
            break;
        };
      };

      function checkOverlap(spriteA, spriteB){
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
      };
  },

  update: function() {
    player.health=session.health;
    playerHealthMeter.update();

    //local controls that broadcast state to server
    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(hunter, layer);
    players.forEach(function(enemy){
      if(game.physics.arcade.collide(player, enemy.sprite)){
        game.physics.arcade.collide(enemy, layer);

        if(player.y+session.attributes.height>enemy.sprite.y-10){
            player.body.velocity.y=-200;
        };

        if(enemy.health>leader.health){
          leader=enemy;
        };
      };
    });

    if(session.health>leader.health){
      leader=session;
    }

    if(leader.theme!==oldTheme){
      console.log('hit');
      music.stop();
      music=game.add.audio(leader.attributes.theme);
      music.play();
      oldTheme=leader.theme;
    };

    player.body.velocity.x = 0;

    if(cursors.down.isDown){
      hunter.frame=1;
      session.attributes.attack(player);
    }else{
      hunter.frame=2;
      session.isAttack=false;
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
    };

    sendUpdate();
    //update server
    function sendUpdate(){
      session.x=player.body.x;
      session.y=player.body.y;
      session.facing=facing;
      var msg={
        type:"clientUpdate",
        clientID:session.clientID,
        session:session
      };
      ws.send(JSON.stringify(msg));
    };
  }
}
