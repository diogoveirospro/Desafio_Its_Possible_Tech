
export interface ITaskDTO {
    /** Domain ID (e.g., T-001) */
    id: string;
    /** Title of the Task */
    title: string;
    /** Status of the Task */
    status: boolean
    /** ISO string representing the task creation date */
    dateCreated: string; // ISO Date string
}
