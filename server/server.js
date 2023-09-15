const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;
const server = require('http').Server(app);
app.use(cors());

const io = require('socket.io')(server, {
    cors: {
        origin:  ['http://localhost:4200'],
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    // socket.on('disconnect', () => {
    //     console.log('user disconnected');
    // });
    socket.on('find-driver', ({points}) => {
        console.log('find-driver: ' + points);
        // io.emit('find-driver', msg);
        const counter = setInterval(() => {
            // io.emit('find-driver', points);
            const coords = points.shift()
            if (!coords) {
                clearInterval(counter)
            }else{
                socket.emit('position', coords);
            }
        }, 1000);
    })

    //to notificationsquicentro
    socket.on('send-notification', ({message}) => {
        io.emit('new-notification', message);
    })
})

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
