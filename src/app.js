import { GLOBALS, getTimestamp } from './Globals.js';
//########## BEGIN INIT SERVER
import { GameServer } from './GameServer';
const ServerGame = new GameServer;
//APP: Make an express server instance
import express from 'express';
const app = express();
app.set('views', './client/views');
app.set('view engine', 'ejs');
const server = require('http').Server(app);

app.use( express.static(__dirname + '/../client') );

app.get('/', (req, res) => {
  res.render('index');
});

//Setup socket.io
const io = require('socket.io')(server);

server.listen(2000, () => {
  console.info(`${getTimestamp()} - Server Initialized on port 2000.`);
});
//########## END INIT SERVER

//A list of every connected Socket
const Socket_List = {};

//Returns 'true' if Username is valid
const isValidUsername = (data, cb) => {
  return cb(true);
};

//This function is called whenever a socket connects
//This currently happens the moment they successfully connect to the webpage
io.on('connection', (socket) => {
  //#TODO: Replace with an actual ID system
  socket.ID = Math.random();
  //Add the connected socket to the list of sockets
  //Check for exists before adding
  Socket_List[socket.ID] = socket;
  console.info(`${getTimestamp()} - Player Connection: ${socket.ID}.`);

  //PlayerData is currently only playerName
  socket.on('joinGame', (playerData) => {
    isValidUsername(playerData, (res) => {
      if( res === true ) {
        let playerX = 120;
        let playerY = 120;
        if( playerData.team === 1 ) {
          playerX = GLOBALS.WORLD_WIDTH - 120;
          playerY = GLOBALS.WORLD_HEIGHT - 120;
        }
        ServerGame.addPlayer(socket, playerData.name, playerData.team, playerX, playerY);
      } else {
        //Username was Invalid
      }
    }); //isValidUsername()
  }); //'joinGame'

  //This function is called whenever a socket disconnects
  //This is currently whenever the client leaves the webpage
  //Removes the socket from the list of connected sockets
  socket.on('disconnect', () => {
    if( ServerGame.players[socket.ID] === undefined ) {
      //Player never joined the game
      console.info(`${getTimestamp()} - ${socket.ID} has left the game.`);
    } else {
      console.info(`${getTimestamp()} - ${ServerGame.players[socket.ID].name} has left the game.`);
    }
    
    delete Socket_List[socket.ID];
    ServerGame.removePack.player.push(socket.ID);
    delete ServerGame.players[socket.ID];
  }); //'disconnect'
}); //'connection'

//SERVER GAME LOOP
setInterval( () => {
  //Gather all of the server's instance data packs
  const packs = ServerGame.getFrameUpdateData();
  //For every connected socket, emit the data packs
  for( let s in Socket_List ) {
    const socket = Socket_List[s];
    if( packs.initPack.player.length > 0 ||
        packs.initPack.bullet.length > 0 ||
        packs.initPack.block.length  > 0 ) {
      socket.emit('init', packs.initPack);
    }
    if( packs.removePack.player.length > 0 ||
        packs.removePack.bullet.length > 0 ) {
      socket.emit('remove', packs.removePack);
    }
    socket.emit('update', packs.updatePack);
  }
  if( ServerGame.mustUpdateGrid === true ) {
    ServerGame.updateGrid();
  }
}, 30); //END SERVER GAME LOOP

/* TODO: random int generator for placement not currently used, not deprecated, yet
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}*/
