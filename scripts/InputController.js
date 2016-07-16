class InputController{
  constructor(player){
    this.player = player;
  }

  update(){
    //======Controll player moving =============================================
    if(this.player.sprite.alive){
      var directionX, directionY;
      if(Razor.keyboard.isDown(Phaser.KeyCode.LEFT)) directionX = -1;
      else if (Razor.keyboard.isDown(Phaser.KeyCode.RIGHT)) directionX = 1;
      else directionX = 0;

      if(Razor.keyboard.isDown(Phaser.KeyCode.UP)) directionY = -1;
      else if (Razor.keyboard.isDown(Phaser.KeyCode.DOWN)) directionY = 1;
      else directionY = 0;

      this.player.update(directionX, directionY, this.player.sprite.health);
      Razor.client.reportMove(this.player.sprite.id, directionX, directionY, this.player.sprite.position, this.player.sprite.health);
      Razor.fire(this.player);
    }
    Razor.onBlastOverlapPlayer();
  }
}
