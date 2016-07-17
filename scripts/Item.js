class Item{
  constructor(x, y, type){
    this.sprite = Razor.itemGroup.create(x, y, type);
    Razor.game.physics.arcade.enable(this.sprite);
    this.sprite.animations.add(type, [0, 1, 2, 3], 4, true);
    this.sprite.animations.play(type);
  }
}
