import express, { NextFunction, Response } from 'express';
const cors = require('cors');
// import socketio from 'socket.io';
const socketio = require('socket.io');
import authRouter from './routes/auth.routes'
import http from 'http'
import onConnectionSocket from './controllers/socketControllers';
import { Socket } from 'socket.io';

const config = require ('config');
const PORT = config.get('port') || 443;

const app = express();
const server = http.createServer(app)
const io: Socket = socketio(server)

app.use(express.json());
app.use(cors({origin: '*'}));
app.use('/api/auth', authRouter);




io.on('connection', onConnectionSocket)

// app.use(cors())

async function start() {
    // app.listen(process.env.PORT || 3000, () => console.log(`App has been started on port ${process.env.PORT}... `));
    server.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
}

start();