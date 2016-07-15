class Blast{
  constructor(x, y, radius, group, id){
    this.sprite = group.create(x, y, 'blast');
    Razor.game.physics.arcade.enable(this.sprite);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.id = id;
    this.sprite.scale.setTo(radius, radius);
  }

  update(){
  }
}
