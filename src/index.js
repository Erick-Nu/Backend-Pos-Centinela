import app from './server.js'
import connection from './database.js';
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config();
connection();


const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.URL_FRONTEND,
        methods: ["GET", "POST"],
    }
})

io.on('connection', (socket) => {
    console.log(`✅ Usuario conectado con ID: ${socket.id}`)
    socket.on('enviar-mensaje-front-back',(payload)=>{
        console.log(`📩 Mensaje recibido de ${socket.id}: ${payload}`);
        socket.emit('enviar-mensaje-front-back',payload)
    })
})

socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
});



server.listen(app.get('port'),()=>{
    console.log(`Server ok on http://localhost:${app.get('port')}`);
})

