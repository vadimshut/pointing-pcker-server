import { ROOMS_DATA } from "../globalConstants"
import IIssue from "../interfaces/IIssue"

export default function modifiedIssue(roomId: string, issueInstance: IIssue): void {
    ROOMS_DATA[roomId].issues.forEach(issue => {
        if (issue.issueId === issueInstance.issueId){
            issue.title = issueInstance.title
            issue.priority = issueInstance.priority
            issue.link = issueInstance.link
        }
    })
}