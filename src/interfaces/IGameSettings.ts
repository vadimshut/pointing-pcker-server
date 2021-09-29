export default interface IGameSettings {
    masterAsPlayer: boolean
    changingCard: boolean
    isTimerNeeded: boolean
    automaticallyAdmitNewMember: boolean
    automaticallyFlipCards: boolean
    scoreType: string
    scoreTypeShort: string
    timerMinutes: number
    timerSeconds: number
    currentShirtCards: string
    cardSetName: string
    currentCardSet: string[]
  }
  