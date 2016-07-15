class Item{
  constructor(x, y){
    this.sprite = Razor.itemGroup.create(x, y, 'diamond');
    Razor.game.physics.arcade.enable(this.sprite);
  }
}
