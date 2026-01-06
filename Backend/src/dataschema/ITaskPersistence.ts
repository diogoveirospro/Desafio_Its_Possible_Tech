/**
 * ITaskPersistence defines the structure of a Task object in the persistence layer.
 */
export interface ITaskPersistence {
    _id: string;
    domainId: string;
    title: string;
    status: boolean;
    dateCreated: Date;
}

