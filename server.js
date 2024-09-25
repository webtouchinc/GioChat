const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store online users
const onlineUsers = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId, username) => {
        socket.join(roomId);
        if (!onlineUsers[roomId]) {
            onlineUsers[roomId] = [];
        }
        onlineUsers[roomId].push(username);
        socket.to(roomId).emit('message', `${username} has joined the chat!`);
        io.to(roomId).emit('updateUserCount', onlineUsers[roomId].length);
    });

    socket.on('chatMessage', (msg, roomId, username) => {
        io.to(roomId).emit('message', `${username}: ${msg}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        for (const roomId in onlineUsers) {
            onlineUsers[roomId] = onlineUsers[roomId].filter(user => user !== socket.username);
            io.to(roomId).emit('updateUserCount', onlineUsers[roomId].length);
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
