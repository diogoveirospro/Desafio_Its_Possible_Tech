import { Modal } from '../../../components/Modal';
import { TaskCreate } from './TaskCreate';
import { TaskEdit } from './TaskEdit';
import { taskListViewModel } from '../viewmodels/TaskListViewModel';

/**
 * Task List Component
 * Main page displaying all tasks with actions
 */
export function TaskList() {
  const {
    tasks,
    isLoading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    selectedTask,
    fetchTasks,
    toggleTask,
    deleteTask,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    onTaskCreated,
    onTaskUpdated,
  } = taskListViewModel();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="task-list-page">
      <div className="container">
        <div className="task-list-container">
          {/* Header */}
          <div className="task-list-header">
            <div className="task-list-title">
              <h1>Tasks</h1>
              {!isLoading && <span className="task-count">{tasks.length}</span>}
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              + New Task
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="task-list-loading">
              <div className="spinner"></div>
              <p>Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="task-list-error">
              <p className="task-list-error-message">{error}</p>
              <button className="btn btn-primary" onClick={fetchTasks}>
                Retry
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3 className="empty-state-title">No tasks yet</h3>
              <p className="empty-state-description">
                Create your first task to get started
              </p>
              <button className="btn btn-primary mt-md" onClick={openCreateModal}>
                Create Task
              </button>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.status ? 'completed' : ''}`}
                >
                  <div className="task-item-header">
                    <h3 className="task-item-title">{task.title}</h3>
                    <span
                      className={`status-badge ${task.status ? 'completed' : 'pending'}`}
                    >
                      {task.status ? 'Done' : 'Pending'}
                    </span>
                  </div>

                  <div className="task-item-meta">
                    <span className="task-item-id">{task.id}</span>
                    <span className="task-item-date">{formatDate(task.dateCreated)}</span>
                  </div>

                  <div className="task-item-actions">
                    <button
                      className="task-action-btn toggle"
                      onClick={() => toggleTask(task.id)}
                      title={task.status ? 'Mark as pending' : 'Mark as complete'}
                    >
                      {task.status ? '↩ Undo' : '✓ Done'}
                    </button>
                    <button
                      className="task-action-btn edit"
                      onClick={() => openEditModal(task)}
                      title="View details"
                    >
                      👁 View
                    </button>
                    <button
                      className="task-action-btn delete"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create New Task"
      >
        <TaskCreate onSuccess={onTaskCreated} onCancel={closeCreateModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Task Details"
      >
        <TaskEdit
          task={selectedTask}
          onSuccess={onTaskUpdated}
          onCancel={closeEditModal}
        />
      </Modal>
    </div>
  );
}

