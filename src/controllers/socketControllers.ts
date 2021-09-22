import { Socket } from "socket.io";
import { ROOMS_DATA } from "../globalConstants";


export default function onConnectionSocket(socket: Socket) {
    console.log('New user connection id: ', socket.id);

     socket.on('createRoom', (roomId) => {createRoom(socket, roomId)})
     socket.on('joinRoom', (roomId, userId) => {joinRoom(socket, roomId, userId)})
     socket.on('members', (roomId) => {getMembers(socket, roomId)})
     socket.on('newUser', (roomId, userId) => {addNewUser(socket, roomId, userId)})

     socket.on('disconnect', function () {
        console.log('A user disconnected id: ', socket.id);
     });
}

function createRoom(socket: Socket, roomId: string){
    socket.join(roomId)
    console.log('create new room ', roomId);
}

function joinRoom(socket: Socket, roomId: string, userId: string) {
    socket.join(roomId)
    const user = ROOMS_DATA[roomId]?.members.filter((member) => member.userId === userId)[0]
    user.socketId = socket.id
    console.log('new user join to room ', roomId);
    console.log(ROOMS_DATA[roomId]?.members);
    
}

function addNewUser(socket: Socket, roomId: string, userId: string) { 
    console.log('action new user id: ', socket.id);
    const newUser = ROOMS_DATA[roomId]?.members.filter(item => item.userId === userId)
    socket.broadcast.emit('addNewUser', {user: newUser})
}

function getMembers(socket: Socket, roomId: string) {
    console.log('action members id: ', socket.id);
    const sendData = ROOMS_DATA[roomId]?.members
    socket.emit('sendMembersToClient', {members: sendData})
}