import {AggregateRoot} from "../../../core/domain/AggregateRoot.js";
import {TaskID} from "../ValueObjects/TaskID.js";
import {TaskTitle} from "../ValueObjects/TaskTitle.js";
import {TaskStatus} from "../ValueObjects/TaskStatus.js";
import {UniqueEntityID} from "../../../core/domain/UniqueEntityID.js";
import {Result} from "../../../core/logic/Result.js";
import {Guard} from "../../../core/logic/Guard.js";

/**
 * Properties required to create a Task
 */
interface TaskProps {
  /**
   * Unique identifier for the Task
   */
  taskId: TaskID;

  /**
   * Title of the Task
   */
  title: TaskTitle;

  /**
   *  Task Status
   */
  status: TaskStatus;

  /**
   * Date when the Task was created
   */
  DateCreated: Date;

}

/**
 * Aggregate root representing a Task in the system
 */
export class Task extends AggregateRoot<TaskProps> {
  /**
   * Gets the Task ID
   */
  get taskId(): TaskID {
    return this.props.taskId;
  }

  /**
   * Gets the title of the Task
   */
  get title(): TaskTitle {
    return this.props.title;
  }

  /**
   * Gets the status of the Task
   */
  get status(): TaskStatus {
    return this.props.status;
  }

  /**
   * Gets the creation date of the Task
   */
  get dateCreated(): Date {
    return this.props.DateCreated;
  }

  /**
   * Private constructor to enforce creation via factory methods
   * @param props - Properties of the Task
   * @param id - Optional unique identifier
   * @private
   */
  private constructor(props: TaskProps, id?: UniqueEntityID) {
    super(props, id);
  }

  /**
   * Static factory method to create a new Task
   * @param props - Properties for the Task
   * @param id - Optional unique identifier
   * @returns Result containing the Task or an error message
   */
  public static create(props: {
    taskId: TaskID | string;
    title: TaskTitle | string;
    status?: TaskStatus;
    DateCreated: Date;
  }, id?: UniqueEntityID): Result<Task> {
    const guardProps = [
      {argument: props.taskId, argumentName: 'taskId'},
      {argument: props.title, argumentName: 'title'},
      {argument: props.status, argumentName: 'status'},
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardProps);
    if (!guardResult.succeeded) {
      return Result.fail<Task>(guardResult.message);
    }

    let titleVo: TaskTitle;
    if (typeof props.title === 'string') {
      const titleOrError = TaskTitle.create(props.title);
      if (titleOrError.isFailure) {
        return Result.fail<Task>(titleOrError.errorValue());
      }
      titleVo = titleOrError.getValue();
    } else {
      titleVo = props.title;
    }

    let taskIdVo: TaskID;
    if (typeof props.taskId === 'string') {
      const taskIdOrError = TaskID.create(props.taskId);
      if (taskIdOrError.isFailure) {
        return Result.fail<Task>(taskIdOrError.errorValue());
      }
      taskIdVo = taskIdOrError.getValue();
    } else {
      taskIdVo = props.taskId;
    }

    // Default status to false if not provided
    const status = props.status || TaskStatus.create(false).getValue();

    const now = new Date();
    const task = new Task({
      taskId: taskIdVo,
      title: titleVo,
      status,
      DateCreated: props.DateCreated || now,
    }, id);

    return Result.ok<Task>(task);
  }


}

