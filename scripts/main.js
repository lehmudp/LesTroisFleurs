//=Initialize variables using in game ==========================================

var Razor = {};
var map;
var layer;
var player;
radius = 0;
radiusAdd = 0.1;
radiusMax = 1.5;
indexBlast = -1;
radiuses = [];
Razor.nextShotAt = 0;
Razor.shotDelay = 4000;
Razor.nextItem = 0;
Razor.itemDelayTime = 5000;
Razor.blasts = [];
count = 0;
bornInOneTurn = 0;

Razor.enemyBlasts = [];

window.onload = function(){
  Razor.game = new Phaser.Game(window.innerWidth,
                               window.innerHeight,
                                Phaser.AUTO,
                                '',
                                {
                                  preload: preload,
                                  create: create,
                                  update: update
                                }
                              );
}

//=Preload =====================================================================

var preload = function(){
    Razor.game.load.tilemap('gamemap', 'assets/tilemaps/maze.json', null, Phaser.Tilemap.TILED_JSON);
    Razor.game.load.image('tiles', 'assets/tilemaps/tileset.png', 16, 16);
    Razor.game.load.image('back', 'assets/map.png');
    Razor.game.load.spritesheet('player', 'assets/lspsprite.png', 40, 47);
    Razor.game.load.image('blast', 'assets/blast.png');
    Razor.game.load.image('tp', 'assets/warpzone.png');
    Razor.game.load.audio('blastSound', ['assets/razorSound.mp3', 'assets/razorSound.ogg']);
    Razor.game.load.spritesheet('health', 'assets/health.png', 28, 100);
    Razor.game.load.spritesheet('speed', 'assets/speed.png', 28, 100);
    Razor.game.load.spritesheet('damage', 'assets/damage.png', 28, 100);

  }

//=Create ======================================================================

var create = function(){
    //=======Create MAP ========================================
    Razor.game.add.sprite(0, 0, 'back');
    map = Razor.game.add.tilemap('gamemap', 16, 16);
    map.addTilesetImage('tileset','tiles');
    layer = map.createLayer(0);
    layer.resizeWorld();
    map.setCollisionBetween(1, 810);
    Razor.game.world.setBounds(0, 0, 3200, 3200);
    //==========================================================
    Razor.keyboard = Razor.game.input.keyboard;
    Razor.game.physics.startSystem(Phaser.Physics.ARCADE);
    //=======Create Group Player =====================================
    Razor.playerGroup = Razor.game.add.physicsGroup();
    Razor.blastGroup = Razor.game.add.physicsGroup();
    Razor.timewarpGroup = Razor.game.add.physicsGroup();
    Razor.enemies = [];
    //=======Create Item =======================================
    Razor.itemGroup = Razor.game.add.physicsGroup();
    Razor.itemGroup.setAll('lifespan', 2000);
    //TELEPORT - create portal
    timewarp = Razor.timewarpGroup.create(948, 2272, 'tp');
    Razor.game.physics.arcade.enable(timewarp);
    Razor.music = Razor.game.add.audio('blastSound');

    var username = prompt("Please enter your username. Try to survive and good luck!!!",
    localStorage.getItem('username') || 'La Fleur');
    username = username || 'La Fleur';
    if(username.length > 20) username = username.substring(0, 19);
    localStorage.setItem('username', username);
    Razor.client = new Client(username);

    var text = "Use arrow to move\nUse spacebar to blast\n4s cooldown your blast\nRed froggy gives you health\nYellow froggy gives you speed\nRa khỏi vùng xuất phát để bắn\nDùng phím mũi tên để di chuyển\nDùng SpaceBar để bắn\nẾch đỏ giúp tăng máu\nẾch vàng giúp tăng tốc"
    Razor.note = Razor.game.add.text(10, 10, '', {
        font: 'bold 11pt Arial',
        fill : 'white',
        stroke : 'black',
        strokeThickness : 3
      });

    Razor.note.setText(text);
    Razor.note.fixedToCamera = true;

}
//=Update ======================================================================
var update = function(){
  Razor.game.physics.arcade.collide(Razor.playerGroup, layer);
  if(Razor.game.inputController){
    Razor.game.inputController.update();
  }

  Razor.game.physics.arcade.overlap(
    Razor.playerGroup,
    Razor.itemGroup,
    onDiamond,
    null,
    this
  );

  Razor.game.physics.arcade.overlap(
    Razor.playerGroup,
    Razor.timewarpGroup,
    onPlayerEnterPortal,
    null,
    this
  );

  createItem();

}

var onDiamond = function(playerSprite, itemSprite){
  if (itemSprite.key == itemHealth.sprite.key && player.sprite.health <= 100){
    player.sprite.health += 20;
    if (player.sprite.health > 100){player.sprite.health = 100}
  }
  else if (itemSprite.key == itemSpeed.sprite.key && player.sprite.playerVelocity < 800){
    player.sprite.playerVelocity += 20;
  };

  itemSprite.kill();
}

var createItem = function(){
  if (Razor.nextItem > Razor.game.time.now){
    return;
  }
  Razor.nextItem = Razor.game.time.now + Razor.itemDelayTime;
  for (count = 0; count < 8; count ++){
    itemHealth = new Item(Math.random()*3200, Math.random()*3200, 'health');
    itemHealth.sprite.lifespan = 3000;
    count += 1
  };

  for (count = 0; count < 9; count ++){
    itemSpeed = new Item(Math.random()*3200, Math.random()*3200, 'speed');
    itemSpeed.sprite.lifespan = 3000;
    count += 1
  };
}

//=========DISCONNECT
Razor.getPlayerById = function(id, killOnSight){
  for(var i=0;i<Razor.enemies.length;i++){
    if(Razor.enemies[i].sprite.id == id){
      return killOnSight ? Razor.enemies.splice(i, 1)[0] : Razor.enemies[i];
    }
  }

  return null;
}
//=========DISCONNECT
Razor.onPlayerDisconnected = function(msg){
 var enemy = Razor.getPlayerById(msg.id, true);
 if(!enemy) return;

 enemy.sprite.destroy();
}


/*
* GAME EVENTS
*/

Razor.onConnected = function(data){
  player = new Player(data.x, data.y, Razor.playerGroup, data.id, data.username);
  player.sprite.anchor.setTo(0.5, 0.5);
  Razor.game.camera.follow(player.sprite);
  Razor.game.inputController = new InputController(player);
}
//==================TELEPORT - Player get teleported when overlap portal

var destinations = [ [661, 500], [3140, 880], [520, 1420], [1720, 2440], [2900, 1800], [1300, 1050], [1900, 150] ];
var  destination = destinations[Math.floor(Math.random()*destinations.length)];
var onPlayerEnterPortal = function(playerSprite, timewarpSprite){
  playerSprite.position.x = destination[0];
  playerSprite.position.y = destination[1];
}

//=====Kill player====================================

Razor.onBlastOverlapPlayer = function(){
  Razor.game.physics.arcade.overlap(
    Razor.blastGroup,
    Razor.playerGroup,
    onBlastKillPlayer,
    null,
    this
  );
}

var onBlastKillPlayer = function(blastSprite, playerSprite){
  if (playerSprite.id != blastSprite.id){
    playerSprite.health -= 1;
  };
  if (playerSprite.health == 0){
    playerSprite.destroy();
  };
}

//Create enemies players from otherPlayer datas=================================
Razor.onReceivedOtherPlayersData = function(datas){
  for(var i=0;i<datas.length;i++){
    Razor.enemies.push(
      new Player(datas[i].x, datas[i].y, Razor.playerGroup, datas[i].id, datas[i].username)
    );
  };
}

//Create enemies from new Player data ==========================================
Razor.onReceivedNewPlayerData = function(data){
  Razor.enemies.push(
    new Player(data.x, data.y, Razor.playerGroup, data.id, data.username)
  );
}

Razor.onEnemyMoved = function(data){
  var enemy = Razor.getPlayerById(data.id);
  enemy.sprite.position = data.position;
  enemy.update(data.directionX, data.directionY, data.health);
}

Razor.onEnemyBlastMoved = function(data){
  var enemyBlast = Razor.getPlayerById(data.id);
  enemyBlast.sprite.position = data.position;
  Razor.createBlast(enemyBlast.sprite.position.x, enemyBlast.sprite.position.y, data.radius, Razor.blastGroup, data.id);
  Razor.onBlastOverlapPlayer();
}

Razor.createBlast = function(positionX, positionY, radius, group, id){
  Razor.blast = new Blast(positionX, positionY, radius, Razor.blastGroup, id)
  Razor.enemyBlasts.push(Razor.blast.sprite);
  if (Razor.enemyBlasts.length >= 2){
    var enemyBlastToKill = Razor.enemyBlasts.splice(0,1)[0];
    enemyBlastToKill.kill();
  };
}




Razor.fire = function(player){
  if (Razor.keyboard.isDown(Phaser.KeyCode.SPACEBAR)){

    if (Razor.blasts.length == 0){

      if (Razor.nextShotAt > Razor.game.time.now){
        return;
      };
      Razor.nextShotAt = Razor.game.time.now + Razor.shotDelay;
      //add blast
      if((player.sprite.x < 1149 && player.sprite.y > 2295) == false){
        Razor.music.play();
        Razor.blast = new Blast(player.sprite.x, player.sprite.y, radius, Razor.blastGroup, player.sprite.id)
        Razor.blasts.push(Razor.blast.sprite);
        Razor.client.reportBlast(player.sprite.id, player.sprite.position, radius);
        radiuses.push(radius);
        indexBlast += 1;
        radius += radiusAdd;
      };
    }
  };

  if (Razor.blasts.length == 1 && radiuses[indexBlast] < radiusMax){
    //add blast
    Razor.blast = new Blast(player.sprite.x, player.sprite.y, radius, Razor.blastGroup, player.sprite.id)
    Razor.blasts.push(Razor.blast.sprite);

    Razor.client.reportBlast(player.sprite.id, player.sprite.position, radius);
    radiuses.push(radius);
    indexBlast += 1;
    if(radiuses[indexBlast] > radiuses[indexBlast - 1]){
      radius += radiusAdd;
    }else {radius -= radiusAdd;}
  }
  else if ((Razor.blasts.length == 1) && (radiuses[indexBlast] >= radiusMax)){
    //add blast
    Razor.blast = new Blast(player.sprite.x, player.sprite.y, radius, Razor.blastGroup, player.sprite.id)
    Razor.blasts.push(Razor.blast.sprite);
    Razor.client.reportBlast(player.sprite.id, player.sprite.position, radius);
    indexBlast += 1;
    radiuses.push(radius);
    radius -= radiusAdd;
  };
  if (Razor.blasts.length >= 2){
    var blastToKill = Razor.blasts.splice(0,1)[0];
    blastToKill.kill();
  };
  if (Razor.blasts.length == 1 && radius < radiusAdd){
    Razor.blasts = [];
    Razor.blast.sprite.kill();
  };
}
