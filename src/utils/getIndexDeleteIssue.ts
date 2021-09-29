import { ROOMS_DATA } from "../globalConstants";

export default function getIndexDeleteIssue(roomID: string, issueId: string) {
    for (let i = 0; i < ROOMS_DATA[roomID].issues.length; i++) {
        if (ROOMS_DATA[roomID].issues[i].issueId === issueId) {
            return {
                issue: ROOMS_DATA[roomID].issues[i],
                index: i
            }
        }
    }
}