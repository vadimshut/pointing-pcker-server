import IChat from "./interfaces/IChat"
import IGameSettings from "./interfaces/IGameSettings"
import IIssue from "./interfaces/IIssue"
import IKickResolution from "./interfaces/IKickResolution"
import IUser from "./interfaces/IUser"



interface IRoomData {    
    members: IUser[],
    kickResolution: IKickResolution[]
    issues: IIssue[]
    chat: IChat[]
    gameSettings: IGameSettings | {}
}

interface IRoomsData {
    [key:string]: IRoomData;
}

export let ROOMS_DATA: IRoomsData = {}
