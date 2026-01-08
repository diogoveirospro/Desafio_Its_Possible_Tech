/**
 * ITaskPersistence defines the structure of a Task object in the persistence layer.
 */
export interface ITaskPersistence {
  /** Mongo document id */
  _id?: string;
  /** External/business identifier (e.g. T-001) */
  taskId: string;
  title: string;
  status: boolean;
  dateCreated: Date;
}
