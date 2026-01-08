import type { Task } from '../models/Task';
import { useTaskCreateViewModel } from '../viewmodels/TaskCreateViewModel';

interface TaskCreateProps {
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

/**
 * Task Create Component
 * Form to create a new task
 */
export function TaskCreate({ onSuccess, onCancel }: TaskCreateProps) {
  const {
    title,
    isSubmitting,
    error,
    isValid,
    handleTitleChange,
    handleSubmit,
    handleCancel,
  } = useTaskCreateViewModel({ onSuccess, onCancel });

  return (
    <form className="task-create-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className={`task-create-input ${error ? 'error' : ''}`}
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          autoFocus
          disabled={isSubmitting}
        />
        {error && <span className="task-create-error">{error}</span>}
        <span className="task-create-hint">
          Task title should be between 3 and 100 characters
        </span>
      </div>

      <div className="task-create-actions">
        <button
          type="button"
          className="task-create-btn cancel"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="task-create-btn submit"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Creating...
            </>
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </form>
  );
}

