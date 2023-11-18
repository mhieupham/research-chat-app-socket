const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors: {
    origin: "http://localhost:3000"
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.user_id;
  let room = '';
  const userName = socket.handshake.auth.user_name;

  socket.broadcast.emit('user-join', {
    user_id: userId
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-left', {
      user_id: userId
    });
    io.to(room).emit('left-room', {
      user_id: userId,
      user_name: userName,
      room: room
    });
  });

  socket.on('chat-message', (msg) => {
    io.to(room).emit('chat-message', {
      user_id: userId,
      user_name: userName,
      msg: msg,
    });
  });

  socket.on('typing', (isTyping) => {
    io.to(room).emit('typing', {
      user_id: userId,
      user_name: userName,
      isTyping: isTyping,
    })
  })

  socket.on('join-room', (data) => {
    room = data.room;
    socket.join(data.room);
    io.to(room).emit('join-room', {
      user_id: userId,
      user_name: userName,
      room: data.room
    });
  })

  socket.on('left-room', (data) => {
    room = data.room;
    socket.leave(data.room);
    io.to(room).emit('left-room', {
      user_id: userId,
      user_name: userName,
      room: data.room
    });
  })
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});
