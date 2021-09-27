import IKickResolution from "./interfaces/IKickResolution"
import IUser from "./interfaces/IUser"



interface IRoomData {    
    members: IUser[],
    kickResolution: IKickResolution[]
}

interface IRoomsData {
    [key:string]: IRoomData;
}

export let ROOMS_DATA: IRoomsData = {}