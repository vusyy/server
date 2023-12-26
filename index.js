const express = require("express");
const app = express();
const http = require ("http");
const cors = require("cors")
const {Server} = require("socket.io");
// const { Socket } = require("dgram");
// const { log } = require("console");

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');


app.use(cors())
app.use(router);


const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    },
})

io.on('connection',(socket)=> {
    console.log(`User Connected ${socket.id}`)
    
    socket.on('send-message', (messagee) =>{
        console.log(messagee);
        io.emit('resived-message', messagee)
        
        
        
    })
    
    socket.on('join', ({ name, room }) => {
        console.log(name, room)
        const { error, user } = addUser({ id: socket.id, name, room });
        
        // if(error) return callback(error);
        
        socket.join(user.room);
        
    socket.emit('resived-message', { user: 'admin', message: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('resived-message', { user: 'admin', message: `${user.name} has joined!` });

    // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    // callback();
  });

    socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

    socket.on('disconnect',()=> {
        console.log('user disconnected');
    })
})

server.listen(4000, ()=> console.log('server running port 4000'))