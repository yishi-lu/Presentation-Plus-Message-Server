
// Let’s make node/socketio listen on port 3000
const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var clientTable = {};
 
io.sockets.on('connection', function(socket){

    const sessionID = socket.id;
    // console.log(sessionID);

    socket.emit('user connected', sessionID);

    socket.on('initialize user info', (user)=>{
        addClient(user);
        // console.log(user);
        socket.emit('user initialized', clientTable);
    })

    socket.on('send message', (data)=>{
        console.log(data);
        let receiverId = findClient(data.receiver_id), senderId = findClient(data.sender_id);

        if(receiverId === null){

            io.to(senderId).emit('send message result', 'offline');

        }
        else {
            io.to(receiverId).emit('receive message', data);

            io.to(senderId).emit('send message result', 'success');
        }
    })

    socket.on('disconnect', function(user) {
        removeClient(user);
        socket.emit('users disconnected', sessionID); //io.emit/io.sockets.emit send message to everyone
    })
})

function addClient(user){
    clientTable[user.id] = user;
}

function removeClient(user){
    delete clientTable[user.id];
}

function findClient(userId){

    let receiver = clientTable[userId];

    if(typeof receiver === "undefined" || receiver === null) return null;
    else return receiver.sessionId;
}

server.listen(3001, () => {
	console.log(`Server is up on 3001`);
});