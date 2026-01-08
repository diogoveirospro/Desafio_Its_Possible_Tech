/**
 * Task Domain Model
 * Represents a Task entity in the frontend domain
 */
export interface Task {
  /** Domain ID (e.g., T-001) */
  id: string;
  /** Title of the Task */
  title: string;
  /** Status of the Task (true = completed, false = pending) */
  status: boolean;
  /** Task creation date */
  dateCreated: Date;
}

