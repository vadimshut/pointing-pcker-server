import IUser from "./IUser";

export default interface IFindUser {
    user: IUser
    index: number
    roomId: string
}