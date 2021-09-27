import { Socket } from "socket.io";
import { nsp } from "../app";
import { ROOMS_DATA } from "../globalConstants";
import IFindUser from "../interfaces/IFindUser";
import IOpenModalKickPlayer from "../interfaces/IOpenModalKickPlayer";
import deleteMemberFromRoom from "../utils/deleteMemberFromRoom";
import findUserInRoom from "../utils/findUserInRoom";
import findUserInRooms from "../utils/findUserInRooms";

export default function onConnectionSocket(socket: Socket) {
    console.log('New user connection id: ', socket.id);

     socket.on('createRoom', (roomId) => {createRoom(socket, roomId)})
     socket.on('joinRoom', (roomId, userId) => {joinRoom(socket, roomId, userId)})
     socket.on('members', (roomId) => {getMembers(socket, roomId)})
     socket.on('newUser', (roomId, userId) => {addNewUser(socket, roomId, userId)})
     socket.on('modalKickPlayerServer', (roomId, isKick, kickMember, kickMemberSocketId) => {
         openModalKickPlayer(socket, roomId, isKick, kickMember, kickMemberSocketId)
     })

     socket.on('resolutionKickMember', (roomId, kickMemberSocketId, kickMemberResolution) => {
         handlerResolutionKickMember(socket, roomId, kickMemberSocketId, kickMemberResolution)
     })

     socket.on('disconnect', () => handlerDisconnect(socket));
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
    const room = nsp.sockets
    console.log(room.keys());
    // console.log(room.values());
    // console.log( nsp.sockets.get(socket.id));
    // console.log(Object.keys( nsp.sockets.get(socket.id)));
    // console.log(Object.keys( nsp.sockets.get(socket.id).adapter));
    // console.log(nsp.sockets.get(socket.id).adapter.rooms);

    // console.log(nsp.sockets.get(socket.id).adapter.rooms.get(roomId));
}

function getMembers(socket: Socket, roomId: string) {
    console.log('Action members id: ', socket.id);
    const sendData = ROOMS_DATA[roomId]?.members
    nsp.to(roomId).emit('sendMembersToClient', {members: sendData})
}

function addNewUser(socket: Socket, roomId: string, userId: string) { 
    console.log('Action new user id: ', socket.id);
    const newUser = ROOMS_DATA[roomId]?.members.filter(item => item.userId === userId)
    socket.to(roomId).emit('addNewUser', {user: newUser})
}

function openModalKickPlayer(
    socket: Socket, 
    roomId: string, 
    isKick: boolean, 
    kickMember: string, 
    kickMemberSocketId: string) {

    const sendData: IOpenModalKickPlayer = {
        isKick: isKick,
        kickMember: kickMember,
        kickMemberSocketId: kickMemberSocketId
    }
    console.log('meber data: ', isKick, kickMember, kickMemberSocketId);
    socket.to(roomId).emit('modalKickPlayerClient', {data: sendData})
}

function handlerResolutionKickMember(
    socket: Socket,
    roomId: string, 
    kickMemberSocketId: string, 
    kickMemberResolution: boolean
) {
    console.log('kick member: ', socket.id);
    
    ROOMS_DATA[roomId].kickResolution?.push({
        roomId: roomId, 
        kickMemberSocketId: kickMemberSocketId, 
        kickMemberResolution: kickMemberResolution
    })

    if (ROOMS_DATA[roomId].kickResolution.length === ROOMS_DATA[roomId].members.length){
        const premitDisconnect = ROOMS_DATA[roomId].kickResolution.filter(item => item.kickMemberResolution === true).length
        const minCountAccept = Math.floor(ROOMS_DATA[roomId].members.length / 2) + 1

        if (premitDisconnect >= minCountAccept) {
            console.log('kick this player', premitDisconnect, minCountAccept);
            const user = findUserInRoom(roomId, kickMemberSocketId)
            if (user !== undefined) {
                deleteMemberFromRoom(user?.roomId, user?.index)
                const sendData = ROOMS_DATA[roomId].members
                nsp.to(roomId).emit('kickMeberFromLobby', {
                    members: sendData,
                    kickerMember: kickMemberSocketId
                })
                console.log(nsp.sockets.get(socket.id).adapter.rooms.get(roomId));
                // nsp.sockets.get(socket.id).adapter.rooms.get(roomId).delete(kickMemberSocketId)
                console.log(nsp.sockets.get(socket.id).adapter.rooms.get(roomId));
            }
        } else {
            console.log("don't kick this player", premitDisconnect, minCountAccept);
        }
       ROOMS_DATA[roomId].kickResolution = []
    }    
}

function handlerDisconnect(socket: Socket) {
    console.log('A user disconnected id: ', socket.id);    
    const rooms: string[] = Object.keys(ROOMS_DATA);
    if (rooms.length == 0) return;
    const disconnectUser = findUserInRooms(rooms, socket.id)
    if (disconnectUser === null) return;

    deleteMemberFromRoom(disconnectUser?.roomId, disconnectUser?.index)
}

