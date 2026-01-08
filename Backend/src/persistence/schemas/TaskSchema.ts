import mongoose, {Schema, Document} from 'mongoose';
import type {ITaskPersistence} from "../../dataschema/ITaskPersistence.js";

/**
 * Mongoose schema for Task aggregate.
 */
const TaskSchema = new Schema(
  {
    taskId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    status: {
      type: Boolean,
      required: true,
      default: false
    },
    dateCreated: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'tasks'
  }
);

/**
 * Export the Mongoose model
 */
export default mongoose.model<ITaskPersistence & Document>('Task', TaskSchema);
