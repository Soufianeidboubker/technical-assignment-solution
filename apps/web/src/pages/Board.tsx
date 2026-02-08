import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi, tasksApi, commentsApi } from '../lib/api';

export default function Board() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch board data
  const { data: board } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardsApi.getBoard(Number(boardId)),
  });

  const { data: columns = [] } = useQuery({
    queryKey: ['columns', boardId],
    queryFn: () => boardsApi.getColumns(Number(boardId)),
  });

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        padding: '1rem 2rem', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{board?.title || 'Loading...'}</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.875rem' }}>
            Created by {board?.creator_name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '250px'
            }}
          />
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Board Columns */}
      <div style={{ 
        padding: '2rem',
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto'
      }}>
        {columns.map((column: any) => (
          <Column
            key={column.id}
            column={column}
            boardId={Number(boardId)}
            searchQuery={searchQuery}
            onTaskClick={setSelectedTask}
            onAddTask={() => setNewTaskColumn(column.id)}
          />
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setSelectedTask(null);
          }}
        />
      )}

      {/* New Task Modal */}
      {newTaskColumn && (
        <NewTaskModal
          columnId={newTaskColumn}
          onClose={() => setNewTaskColumn(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setNewTaskColumn(null);
          }}
        />
      )}
    </div>
  );
}

// Column Component
function Column({ column, boardId, searchQuery, onTaskClick, onAddTask }: any) {
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', column.id, searchQuery],
    queryFn: () => tasksApi.getTasks(column.id, { search: searchQuery, limit: 50 }),
  });

  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: any) => tasksApi.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleDragStart = (e: React.DragEvent, task: any) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('sourceColumnId', column.id.toString());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const sourceColumnId = parseInt(e.dataTransfer.getData('sourceColumnId'));

    if (sourceColumnId !== column.id) {
      updateTaskMutation.mutate({
        taskId,
        data: { column_id: column.id }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const tasks = tasksData?.tasks || [];

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        background: '#e9ecef',
        padding: '1rem',
        borderRadius: '8px',
        minWidth: '300px',
        maxWidth: '300px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          {column.title} ({tasks.length})
        </h3>
        <button
          onClick={onAddTask}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.75rem',
            cursor: 'pointer',
            fontSize: '1.25rem'
          }}
        >
          +
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.map((task: any) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onClick={() => onTaskClick(task)}
            style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '6px',
              cursor: 'move',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #dee2e6'
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
              {task.title}
            </h4>
            {task.description && (
              <p style={{ 
                margin: '0 0 0.5rem', 
                fontSize: '0.85rem', 
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {task.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                background: task.priority === 'high' ? '#ffc107' : 
                           task.priority === 'medium' ? '#17a2b8' : '#6c757d',
                color: 'white'
              }}>
                {task.priority}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                by {task.creator_name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Task Detail Modal
function TaskDetailModal({ task, onClose, onUpdate }: any) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => commentsApi.getComments(task.id),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.createComment(task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
      setComment('');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(task.id),
    onSuccess: onUpdate,
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{task.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '1rem' }}>{task.description || 'No description'}</p>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            background: task.priority === 'high' ? '#ffc107' : 
                       task.priority === 'medium' ? '#17a2b8' : '#6c757d',
            color: 'white',
            fontSize: '0.875rem'
          }}>
            Priority: {task.priority}
          </span>
          <span style={{ color: '#666', fontSize: '0.875rem' }}>
            Created by {task.creator_name}
          </span>
        </div>

        <hr style={{ margin: '1.5rem 0' }} />

        <h3 style={{ marginTop: 0 }}>Comments ({comments.length})</h3>

        <div style={{ marginBottom: '1rem' }}>
          {comments.map((c: any) => (
            <div key={c.id} style={{
              padding: '0.75rem',
              background: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                {c.user_name} • {new Date(c.created_at).toLocaleString()}
              </div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '80px',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              disabled={!comment.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: comment.trim() ? 'pointer' : 'not-allowed',
                opacity: comment.trim() ? 1 : 0.5
              }}
            >
              Add Comment
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this task?')) {
                  deleteTaskMutation.mutate();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Delete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// New Task Modal
function NewTaskModal({ columnId, onClose, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.createTask(columnId, data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({ title, description, priority });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2 style={{ marginTop: 0 }}>Create New Task</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '100px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}