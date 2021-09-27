import { ROOMS_DATA } from "../globalConstants"
import IFindUser from "../interfaces/IFindUser"

export default function findUserInRoom(roomId: string, socketId: string): IFindUser | undefined {
    for (let i = 0; i < ROOMS_DATA[roomId].members.length; i++){
        if(ROOMS_DATA[roomId].members[i].socketId === socketId) {
            const result = {
                user: ROOMS_DATA[roomId].members[i],
                index: i,
                roomId: roomId
            }
            return result
        } 
    }
}