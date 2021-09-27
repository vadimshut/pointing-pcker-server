import { ROOMS_DATA } from "../globalConstants";

export default function deleteMemberFromRoom(roomId: string, index: number) {
    ROOMS_DATA[roomId].members.splice(index, 1)
}