class Blast{
  constructor(player){
    this.sprite = Razor.game.add.sprite(player.sprite.x, player.sprite.y, 'blast');
    Razor.game.physics.arcade.enable(this.sprite);
    this.sprite.anchor.setTo(0.5, 0.5);
  }

  update(){
  }
}
