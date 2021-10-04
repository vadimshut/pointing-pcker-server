import { Socket } from "socket.io"
import { nsp } from ".."
import { ROOMS_DATA } from "../globalConstants";
const { v4: uuidv4 } = require('uuid');

export default function sendChatMessage(socket: Socket, message: string, roomId: string, firstName: string, lastName: string, jobPossition: string, image: string, userId: string ) {
    const chatInstance = {
        userName: firstName,
        userId: userId,
        userLastName: lastName,
        userJobPosition: jobPossition,
        userImageURL: image,
        userText: message,
        messageId: uuidv4()
    }
    ROOMS_DATA[roomId].chat.push(chatInstance)
    nsp.to(roomId).emit('newChatMessage', ROOMS_DATA[roomId].chat)
  }
  
