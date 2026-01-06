import {Entity} from "../../../core/domain/Entity.js";
import {UniqueEntityID} from "../../../core/domain/UniqueEntityID.js";
import {Result} from "../../../core/logic/Result.js";
import {Guard} from "../../../core/logic/Guard.js";
import {createIdPattern} from "../../../utils/IdGenerator.js";

/**
 * Domain-level typed identifier for Task.
 */
export class TaskID extends Entity<any> {
  /**
   * Gets the UniqueEntityID of the TaskID.
   */
  get id(): UniqueEntityID {
    return this._id;
  }

  /**
   * Constructor for TaskID.
   * @param id - Optional UniqueEntityID.
   * @private
   */
  private constructor(id?: UniqueEntityID) {
    super(null, id);
  }

  /**
   * Factory to create an IncidentTypeID from a string id.
   * Validates format (T-INC###).
   */
  public static create(id?: string): Result<TaskID> {
    const guardResult = Guard.againstNullOrUndefined(id, 'taskId');
    if (!guardResult.succeeded) {
      return Result.fail<TaskID>(guardResult.message);
    }
    const trimmed = id!.trim();
    const pattern = createIdPattern();
    if (!pattern.test(trimmed)) {
      return Result.fail<TaskID>("incidentTypeId must match pattern T-INC###");
    }
    return Result.ok<TaskID>(new TaskID(new UniqueEntityID(trimmed)));
  }
}
