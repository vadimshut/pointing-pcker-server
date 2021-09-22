export default interface IUser {
  firstName: string
  lastName: string
  jobPossition: string
  image: string
  isAdmin: boolean
  isObserver: boolean
  isPlayer: boolean
  userId: string
  roomId: string
  authentification?: boolean
  socketId?: string
}