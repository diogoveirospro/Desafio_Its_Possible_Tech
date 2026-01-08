import type { Task } from '../models/Task';
import { taskEditViewModel } from '../viewmodels/TaskEditViewModel';

interface TaskEditProps {
  task: Task | null;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

/**
 * Task Edit Component
 * Form to edit/view task details
 */
export function TaskEdit({ task, onSuccess, onCancel }: TaskEditProps) {
  const {
    status,
    isSubmitting,
    error,
    handleToggleStatus,
    handleCancel,
  } = taskEditViewModel({ task, onSuccess, onCancel });

  if (!task) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="task-edit-form">
      {/* Task Info */}
      <div className="task-edit-info">
        <div className="task-edit-info-item">
          <span className="task-edit-info-label">ID</span>
          <span className="task-edit-info-value">{task.id}</span>
        </div>
        <div className="task-edit-info-item">
          <span className="task-edit-info-label">Created</span>
          <span className="task-edit-info-value">{formatDate(task.dateCreated)}</span>
        </div>
      </div>

      {/* Title (Read-only) */}
      <div className="task-edit-field">
        <label className="task-edit-label">Title</label>
        <input
          type="text"
          className="task-edit-input"
          value={task.title}
          disabled
          readOnly
        />
      </div>

      {/* Status Toggle */}
      <div className="task-edit-field">
        <label className="task-edit-label">Status</label>
        <div className="task-edit-status">
          <button
            type="button"
            className={`task-edit-status-toggle ${status ? 'active' : ''}`}
            onClick={handleToggleStatus}
            disabled={isSubmitting}
            aria-label="Toggle task status"
          />
          <span className={`task-edit-status-text ${status ? 'completed' : 'pending'}`}>
            {status ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>

      {error && <div className="task-edit-error">{error}</div>}

      <div className="task-edit-actions">
        <button
          type="button"
          className="task-edit-btn cancel"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Close
        </button>
      </div>
    </div>
  );
}

