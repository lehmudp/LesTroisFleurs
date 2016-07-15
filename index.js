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
var getPlayerById = function(id){
  for(var i=0;i<players.length;i++){
    if(players[i].id == id){
      return players[i];
    }
  }
}

io.on('connection', function(socket){//when a new user connect
  console.log('New User Connected');

  socket.emit('other_players', players);//send info of other players to new player

  var newPlayerInfo = {
    id : socket.id,
    x : Math.random()*3200,
    y : Math.random()*3200
  }

  socket.emit('connected', newPlayerInfo);//tell the new player the position
  socket.broadcast.emit('new_player_connected', newPlayerInfo);//send newplayer info to other players
  players.push(newPlayerInfo);//add info to array players

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
});
