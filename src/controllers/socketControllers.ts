import { Socket } from "socket.io";
import { nsp } from "../app";
import { ROOMS_DATA } from "../globalConstants";
import IGameSettings from "../interfaces/IGameSettings";
import IIssue from "../interfaces/IIssue";
import IOpenModalKickPlayer from "../interfaces/IOpenModalKickPlayer";
import deleteMemberFromRoom from "../utils/deleteMemberFromRoom";
import findUserInRoom from "../utils/findUserInRoom";
import findUserInRooms from "../utils/findUserInRooms";
import getIndexDeleteIssue from "../utils/getIndexDeleteIssue";
import modifiedIssue from "../utils/modifiedIssue";
import sendChatMessage from './chatController'

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
     socket.on('kickMeFromRoom', (roomId) => {handlerKickMeFromRoom(socket, roomId)})
     socket.on('newIssue', (roomId, issueInstance) => {handlerNewIssue(socket, roomId, issueInstance)})
     socket.on('deleteIssueCard', (roomId, issueId) => {handdleDeleteIssueCard(socket, roomId, issueId)})
     socket.on('modifiedIssue', (roomId, issueId) => {handdleModifiedIssueCard(socket, roomId, issueId)})
     socket.on('sendMessage', (message, roomId, firstName, lastName, jobPossition, image, userId) => {
        sendChatMessage(socket, message, roomId, firstName, lastName, jobPossition, image, userId)
     })
     socket.on('getChatMessages', (roomId) => {handlerChatMessages(roomId)})
     socket.on('startGame', (roomId, startGame, gameSettings) => {handleStartGame(socket, roomId, startGame, gameSettings)})
     socket.on('getGameSettings', (roomId) => {handlerSendGameSettings(socket, roomId)})
     socket.on('exitGameServer', (roomId) => {handleExitGameServer(socket, roomId)})
     socket.on('cancelGameServer', (roomId) => {handleCancelGame(socket, roomId)}) //TODO
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
}


function getMembers(socket: Socket, roomId: string) {
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
    socket.to(roomId).emit('modalKickPlayerClient', {data: sendData})
}

function handlerResolutionKickMember(
    socket: Socket,
    roomId: string, 
    kickMemberSocketId: string, 
    kickMemberResolution: boolean
) {    
    ROOMS_DATA[roomId].kickResolution?.push({
        roomId: roomId, 
        kickMemberSocketId: kickMemberSocketId, 
        kickMemberResolution: kickMemberResolution
    })

    if (ROOMS_DATA[roomId].kickResolution.length === ROOMS_DATA[roomId].members.length){
        const premitDisconnect = ROOMS_DATA[roomId].kickResolution.filter(item => item.kickMemberResolution === true).length
        const minCountAccept = Math.floor(ROOMS_DATA[roomId].members.length / 2) + 1

        if (premitDisconnect >= minCountAccept) {
            const user = findUserInRoom(roomId, kickMemberSocketId)
            if (user !== undefined) {
                deleteMemberFromRoom(user?.roomId, user?.index)
                const sendData = ROOMS_DATA[roomId].members
                nsp.to(roomId).emit('kickMeberFromLobby', {
                    members: sendData,
                    kickerMember: kickMemberSocketId
                })
                // nsp.sockets.get(socket.id).adapter.rooms.get(roomId).delete(kickMemberSocketId)
            }
        } else {
            console.log("don't kick this player", premitDisconnect, minCountAccept);
        }
       ROOMS_DATA[roomId].kickResolution = []
    }    
}

function handlerKickMeFromRoom(socket: Socket, roomId: string) {
    console.log(nsp.sockets.get(socket.id).adapter.rooms.get(roomId));
    socket.leave(roomId)
    console.log(nsp.sockets.get(socket.id).adapter.rooms.get(roomId));
}


function handlerNewIssue(socket: Socket, roomId: string, issueInstance: IIssue) {
    ROOMS_DATA[roomId].issues.push(issueInstance)
    const issues = ROOMS_DATA[roomId].issues
    nsp.to(roomId).emit('issues', {issues: issues})
}

function handdleDeleteIssueCard(socket: Socket, roomId: string, issueId: string) {
    const deleteIssue = getIndexDeleteIssue(roomId, issueId)
    if (deleteIssue === undefined) return;
    ROOMS_DATA[roomId].issues.splice(deleteIssue.index, 1)
    const issues = ROOMS_DATA[roomId].issues
    nsp.to(roomId).emit('issues', {issues: issues})
}

function handdleModifiedIssueCard(socket: Socket, roomId: string, issueInstance: IIssue) {
    modifiedIssue(roomId, issueInstance)
    const issues = ROOMS_DATA[roomId].issues
    nsp.to(roomId).emit('issues', {issues: issues})
}


function handleStartGame(socket: Socket, roomId: string, startGame: boolean, gameSettings: IGameSettings) {
    ROOMS_DATA[roomId].gameSettings = gameSettings
    nsp.to(roomId).emit('startGameClient', startGame)
}

function handlerSendGameSettings(socket: Socket, roomId: string) {
    nsp.to(roomId).emit('setGameSettings', ROOMS_DATA[roomId].gameSettings)
}


function handlerChatMessages(roomId: string) {
    nsp.to(roomId).emit('newChatMessage', ROOMS_DATA[roomId].chat)
}

function handleCancelGame(socket: Socket, roomId: string) {
    const rooms: string[] = Object.keys(ROOMS_DATA);
    const disconnectUser = findUserInRooms(rooms, socket.id)
    if (disconnectUser !== null) {
        delete ROOMS_DATA[disconnectUser.roomId]
        nsp.to(disconnectUser.roomId).emit('cancelGameClient') 
    }
}

function handleExitGameServer(socket: Socket, roomId: string) {
    const disconnectUser = findUserInRoom(roomId, socket.id)
    if (disconnectUser !== undefined) {
        deleteMemberFromRoom(roomId, disconnectUser?.index)
        const sendData = ROOMS_DATA[disconnectUser.roomId]?.members
        nsp.to(disconnectUser.roomId).emit('deleteMembers', {members: sendData})
    }
    nsp.to(roomId).emit('exitGameClient', {exit: true, socketId: socket.id}) 
    socket.leave(roomId)
}

function handlerDisconnect(socket: Socket) {
    console.log('A user disconnected id: ', socket.id);    
    const rooms: string[] = Object.keys(ROOMS_DATA);
    if (rooms.length == 0) return;
    const disconnectUser = findUserInRooms(rooms, socket.id)
    if (disconnectUser === null) return;
    deleteMemberFromRoom(disconnectUser?.roomId, disconnectUser?.index)
    if (!disconnectUser.user.isAdmin) {
        const sendData = ROOMS_DATA[disconnectUser.roomId]?.members
        nsp.to(disconnectUser.roomId).emit('deleteMembers', {members: sendData})
    } 
    if (disconnectUser.user.isAdmin) {
        delete ROOMS_DATA[disconnectUser.roomId]
        nsp.to(disconnectUser.roomId).emit('cancelGameClient', {exitGame: true}) //TODO
    }
}
