import IUser from "./interfaces/IUser"

interface IRoomData {    
    members: IUser[],
}

interface IRoomsData {
    [key:string]: IRoomData;
}

export let ROOMS_DATA: IRoomsData = {}