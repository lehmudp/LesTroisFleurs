class Player{
  constructor(x, y, group, id){
    this.sprite = group.create(x, y, 'player');
    Razor.game.physics.arcade.enable(this.sprite);
    this.sprite.anchor.set(0.5,0.5);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.health = 5;
    this.sprite.id = id;
    this.sprite.animations.add('idle', [0, 1, 2], 4, true);
    this.sprite.animations.add('down', [3, 4, 5, 6], 6, true);
    this.sprite.animations.add('left', [7, 8, 9, 10], 6, true);
    this.sprite.animations.add('right', [11, 12, 13, 14], 6, true);
    this.sprite.animations.add('up', [15, 16, 17, 18], 6, true);
  }

  update(directionX, directionY){
    if(directionX < 0){
      this.sprite.body.velocity.x = -800;
      this.sprite.animations.play('left');
    }
    else if (directionX > 0){
      this.sprite.body.velocity.x = 800;
      this.sprite.animations.play('right');
    }

    else if(directionY < 0){
      this.sprite.body.velocity.y = -800;
      this.sprite.animations.play('up');
    }
    else if (directionY > 0){
      this.sprite.body.velocity.y = 800;
      this.sprite.animations.play('down');
    }
    else{
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
      this.sprite.animations.play('idle');
    }
  }
}
