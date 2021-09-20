import { Socket } from "socket.io";
import { ROOMS_DATA } from "../globalConstants";

let count = 0 
export default function onConnectionSocket(io: Socket) {
    console.log('New user connection: ', count);
    count += 1

    io.on('disconnect', function () {
        console.log('A user disconnected');
     });

    io.on('createRoom', (roomId) => {createRoom(io, roomId)})
}

function createRoom(io: Socket, roomId: string){
    io.join(roomId)
    console.log('create new room ', roomId);
    io.send({createRoom: true})
    
}
