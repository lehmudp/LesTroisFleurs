class Client{
  constructor(username){

    this.socket = io();
    var that = this;

    that.socket.emit('login', username);

    this.socket.on('connected', function(msg){
      Razor.onConnected(msg);
      that.id = msg.id;
    });

    this.socket.on('other_players', function(msg){
      Razor.onReceivedOtherPlayersData(msg);
    });

    this.socket.on('new_player_connected', function(msg){
      Razor.onReceivedNewPlayerData(msg);
    });
    this.socket.on('enemy_moved', function(msg){
      Razor.onEnemyMoved(msg);
    });
    this.socket.on('enemyBlast_moved', function(msg){
      Razor.onEnemyBlastMoved(msg);
    });
  }

  reportMove(id, directionX, directionY, position){
    this.socket.emit('player_moved', {
      id        : id,
      directionX : directionX,
      directionY : directionY,
      position  : position
    });
  }

  reportBlast(id, position, radius){
    this.socket.emit('blast_fired',{
      id : id,
      position : position,
      radius : radius,
    })
  }
}
