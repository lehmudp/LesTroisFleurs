class InputController{
  constructor(player){

  }

  update(){
    //======Controll player moving =============================================
    if(player.sprite.alive){
      var directionX, directionY;
      if(Razor.keyboard.isDown(Phaser.KeyCode.LEFT)) directionX = -1;
      else if (Razor.keyboard.isDown(Phaser.KeyCode.RIGHT)) directionX = 1;
      else directionX = 0;

      if(Razor.keyboard.isDown(Phaser.KeyCode.UP)) directionY = -1;
      else if (Razor.keyboard.isDown(Phaser.KeyCode.DOWN)) directionY = 1;
      else directionY = 0;

      player.update(directionX, directionY);
      Razor.client.reportMove(player.sprite.id, directionX, directionY, player.sprite.position);
      Razor.fire(player);
    }
    Razor.onBlastOverlapPlayer();
  }
}
