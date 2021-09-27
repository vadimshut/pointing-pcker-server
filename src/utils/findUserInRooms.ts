import { ROOMS_DATA } from "../globalConstants"
import IFindUser from "../interfaces/IFindUser"
import IUser from "../interfaces/IUser"

export default function findUserInRooms(rooms: string[], socketId: string): IFindUser | null {
    for (let i=0; i < rooms.length; i++) {
        const userInRooms: (IFindUser | null)[] = ROOMS_DATA[rooms[i]].members.map((item: IUser, idx: number) => {
            if(item.socketId === socketId) {
                return {
                    user: item,
                    index: idx,
                    roomId: rooms[i]
                }
            }
            return null
        })
        const filterUserInRooms = userInRooms.filter(item => item !== null)
        if (filterUserInRooms.length > 0 && filterUserInRooms[0] !== null) {
            const user: IFindUser = filterUserInRooms[0]
           return user
        } 
    }
    return null
}