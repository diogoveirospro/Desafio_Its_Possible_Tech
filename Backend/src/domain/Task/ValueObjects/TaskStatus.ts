import {Result} from "../../../core/logic/Result.js";
import {Guard} from "../../../core/logic/Guard.js";

/**
 * Properties for TaskStatus value object.
 */
interface TaskStatusProps {
  value: boolean;
}

/**
 * Value object representing the status of a Task.
 */
export class TaskStatus {

  /**
   * Constructor for TaskStatus.
   * @param props
   * @private
   */
  private constructor(private readonly props: TaskStatusProps) {
  }

  /**
   * Gets the boolean value of the TaskStatus.
   */
  get value(): boolean {
    return this.props.value;
  }

  /**
   * Factory method to create a TaskStatus.
   * @param value
   */
  public static create(value: boolean): Result<TaskStatus> {
    const guardResult = Guard.againstNullOrUndefined(value, 'TaskStatus');
    if (!guardResult.succeeded) {
      return Result.fail<TaskStatus>(guardResult.message);
    }

    return Result.ok<TaskStatus>(new TaskStatus({value}));
  }
}
