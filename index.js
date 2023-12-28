const express = require("express");
const app = express();
const http = require ("http");
const cors = require("cors")
const {Server} = require("socket.io");
// const { Socket } = require("dgram");
// const { log } = require("console");

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

// const router = require('./router');


app.use(cors())
// app.use(router);


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
        const user = getUser(socket.id);

        console.log(messagee);
        
        io.to(user.room).emit('resived-message', messagee)
    })
    
    socket.on('join', ({ name, room }) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        console.log(name, room)
        
        // if(error) return callback(error);
        
        socket.join(user.room);
        
    socket.emit('resived-message', { user: 'admin', message: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('resived-message', { user: 'admin', message: `${user.name} has joined!` });

    
    // callback();
});

//     socket.on('sendMessage', (message, callback) => {
//         const user = getUser(socket.id);
    
//     io.to(user.room).emit('message', { user: user.name, text: message });
//     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

//     callback();
//   });

    socket.on('disconnect',()=> {
        console.log('user disconnected');
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('resived-message', { user: 'Admin', message: `${user.name} has left.` });
        }
    })
})

server.listen(4000, ()=> console.log('server running port 4000'))