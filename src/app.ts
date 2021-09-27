import express, { NextFunction, Response } from 'express';
const cors = require('cors');
// import socketio from 'socket.io';
const socketio = require('socket.io');
import authRouter from './routes/auth.routes'
import http from 'http'
import { Socket } from 'socket.io';
import onConnectionSocket from './controllers/socketControllers';


const config = require ('config');
const PORT = config.get('port') || 443;

const app = express();
const server = http.createServer(app)
const io = socketio(server)
export const nsp = io.of('/lobby')

app.use(express.json());
app.use(cors({origin: '*'}));
app.use('/api/auth', authRouter);
nsp.on('connection',  onConnectionSocket)

async function start() {
    // app.listen(process.env.PORT || 3000, () => console.log(`App has been started on port ${process.env.PORT}... `));
    server.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
}

start();