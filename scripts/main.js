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
Razor.nextShotItem = 0;
Razor.itemDelayTime = 2000;
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
  }

//=Create ======================================================================

var create = function(){
    Razor.client = new Client();
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
    Razor.enemies = [];
    //=======Create Item =======================================
    Razor.itemGroup = Razor.game.add.physicsGroup();
    Razor.itemGroup.setAll('lifespan', 2000);
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

}

var onDiamond = function(playerSprite, itemSprite){
  itemSprite.kill();
}

var createItem = function(){
  if (Razor.nextShotItem > Razor.game.time.now){
    return;
  }
  Razor.nextShotItem = Razor.game.time.now + Razor.itemDelayTime;
  if (count < 50){
    item = new Item(Math.random()*500, Math.random()*500);
    item.sprite.lifespan = 2000;
    count += 1;
  };
}
/*
 *  HELPER FUNCTIONS
 */
Razor.getPlayerById = function(id){
  for(var i=0;i<Razor.enemies.length;i++){
    if(Razor.enemies[i].sprite.id == id){
      return Razor.enemies[i];
    }
  }
}
/*
* GAME EVENTS
*/

Razor.onConnected = function(data){
  player = new Player(data.x, data.y, Razor.playerGroup, data.id);
  player.sprite.anchor.setTo(0.5, 0.5);
  Razor.game.camera.follow(player.sprite);
  Razor.game.inputController = new InputController(player);
}

//Create enemies players from otherPlayer datas=================================
Razor.onReceivedOtherPlayersData = function(datas){
  for(var i=0;i<datas.length;i++){
    Razor.enemies.push(
      new Player(datas[i].x, datas[i].y, Razor.playerGroup, datas[i].id)
    );
  };
}

//Create enemies from new Player data ==========================================
Razor.onReceivedNewPlayerData = function(data){
  Razor.enemies.push(
    new Player(data.x, data.y, Razor.playerGroup, data.id)
  );
}

Razor.onEnemyMoved = function(data){
  var enemy = Razor.getPlayerById(data.id);
  enemy.sprite.position = data.position;
  enemy.update(data.directionX, data.directionY);
}

Razor.onEnemyBlastMoved = function(data){
  var enemyBlast = Razor.getPlayerById(data.id);
  enemyBlast.sprite.position = data.position;
  Razor.createBlast(enemyBlast.sprite.position.x, enemyBlast.sprite.position.y, data.radius);

}

Razor.createBlast = function(positionX, positionY, radius){
  Razor.blast = Razor.game.add.sprite(positionX, positionY, 'blast');
  Razor.blast.scale.setTo(radius, radius);
  Razor.blast.anchor.setTo(0.5, 0.5);
  Razor.enemyBlasts.push(Razor.blast);
  console.log(Razor.enemyBlasts);
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
      }
      Razor.nextShotAt = Razor.game.time.now + Razor.shotDelay;
      //add blast
      Razor.blast = Razor.game.add.sprite(player.sprite.x, player.sprite.y, 'blast');
      Razor.blast.scale.setTo(radius, radius);
      Razor.blast.anchor.setTo(0.5, 0.5);

      Razor.client.reportBlast(player.sprite.id, player.sprite.position, radius);


      Razor.blasts.push(Razor.blast);
      radiuses.push(radius);
      indexBlast += 1;
      radius += radiusAdd;
    }
  };

  if (Razor.blasts.length == 1 && radiuses[indexBlast] < radiusMax){
    //add blast
    Razor.blast = Razor.game.add.sprite(player.sprite.x, player.sprite.y, 'blast');
    Razor.blast.scale.setTo(radius, radius);
    Razor.blast.anchor.setTo(0.5, 0.5);

    Razor.client.reportBlast(player.sprite.id, player.sprite.position, radius);

    Razor.blasts.push(Razor.blast);
    radiuses.push(radius);
    indexBlast += 1;
    if(radiuses[indexBlast] > radiuses[indexBlast - 1]){
      radius += radiusAdd;
    }else {radius -= radiusAdd;}
  }
  else if ((Razor.blasts.length == 1) && (radiuses[indexBlast] >= radiusMax)){
    //add blast
    Razor.blast = Razor.game.add.sprite(player.sprite.x, player.sprite.y, 'blast');
    Razor.blast.scale.setTo(radius, radius);
    Razor.blast.anchor.setTo(0.5, 0.5);

    Razor.client.reportBlast(player.sprite.id, player.sprite.position, radius);

    Razor.blasts.push(Razor.blast);
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
    Razor.blast.kill();
  };
}
