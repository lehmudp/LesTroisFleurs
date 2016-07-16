//==Default setting ============================================================
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + 'index.html');
});

http.listen(3333, function(){
  console.log('Server started. Listening on *:3333');
});

//==Working Space ==============================================================
var players = [];
//=========DISCONNECT=== Remove id from array if user disconnected (killOnSight=true)
var getPlayerById = function(id, killOnSight){
  for(var i=0;i<players.length;i++){
    if(players[i].id == id){
      return killOnSight ? players.splice(i, 1)[0] : players[i];
    }
  }
  return null;
}

io.on('connection', function(socket){//when a new user connect
  console.log('New User Connected');

  socket.emit('other_players', players);//send info of other players to new player
  socket.on('login', function(data){
  var newPlayerInfo = {
    username : data,
    id : socket.id,
    x : 35,
    y : 2626,
  };

  socket.on('disconnect', function(msg){
      socket.broadcast.emit('delPlayer', newPlayerInfo);
  });

  socket.emit('connected', newPlayerInfo);//tell the new player the position
  socket.broadcast.emit('new_player_connected', newPlayerInfo);//send newplayer info to other players
  players.push(newPlayerInfo);//add info to array players

  });
  socket.on('player_moved', function(data){
    var playerInfo = getPlayerById(data.id);
    playerInfo.x = data.position.x;
    playerInfo.y = data.position.y;
    socket.broadcast.emit('enemy_moved', data);
  });

  socket.on('blast_fired', function(data){
    var blastInfo = getPlayerById(data.id);
    blastInfo.x = data.position.x;
    blastInfo.y = data.position.y;
    socket.broadcast.emit('enemyBlast_moved', data);
  });

  //=========DISCONNECT
  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.id);
    if(getPlayerById(socket.id, true)){
      socket.broadcast.emit('playerDisconnected', {id : socket.id});
    }
  });
});
