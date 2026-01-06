import {ValueObject} from "../../../core/domain/ValueObject.js";
import {Result} from "../../../core/logic/Result.js";
import {Guard} from "../../../core/logic/Guard.js";

/**
 * Properties for TaskTitle value object.
 */
interface TaskTitleProps {
  value: string;
}

/**
 * Value object representing the title of a Task.
 */
export class TaskTitle extends ValueObject<TaskTitleProps> {

  /**
   * Gets the string value of the TaskTitle.
   */
  get value(): string {
    return this.props.value;
  }

  /**
   * Constructor for TaskTitle.
   * @param props - Properties for TaskTitle.
   * @private
   */
  private constructor(props: TaskTitleProps) {
    super(props);
  }

  /**
   * Factory method to create a TaskTitle.
   * @param value
   */
  public static create(value: string): Result<TaskTitle> {
    const guardResult = Guard.againstNullOrUndefined(value, 'TaskTitle');
    if (!guardResult.succeeded) {
      return Result.fail<TaskTitle>(guardResult.message);
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return Result.fail<TaskTitle>('Task title cannot be empty');
    }

    return Result.ok<TaskTitle>(new TaskTitle({value: trimmed}));
  }
}
