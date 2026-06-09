import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import KanbanBoard from '../components/Tasks/KanbanBoard';
import TaskList from '../components/Tasks/TaskList';
import TaskModal from '../components/Tasks/TaskModal';

const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: active ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      cursor: 'pointer', transition: 'all var(--transition)', fontFamily: 'inherit',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [selectedTask, setSelectedTask] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', assignee: '', search: '' });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignee) params.assignee = filters.assignee;
    if (filters.search) params.search = filters.search;
    const res = await api.get('/tasks', { params });
    setTasks(res.data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { api.get('/users').then(r => setUsers(r.data)); }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await api.put(`/tasks/${taskId}`, { status: newStatus });
  };

  const handleSaved = () => {
    setSelectedTask(null);
    setCreateOpen(false);
    loadTasks();
  };

  const viewBtnStyle = (active) => ({
    padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
    background: active ? 'var(--bg-tertiary)' : 'none',
    border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer', transition: 'all var(--transition)', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Tasks</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4 }}>
            <button style={viewBtnStyle(view === 'kanban')} onClick={() => setView('kanban')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18"/><rect x="10" y="3" width="5" height="18"/><rect x="17" y="3" width="4" height="18"/></svg>
              Board
            </button>
            <button style={viewBtnStyle(view === 'list')} onClick={() => setView('list')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              List
            </button>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
              color: '#fff', padding: '8px 16px', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Task
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <input
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search tasks..."
          style={{
            padding: '7px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 13,
            outline: 'none', width: 200, fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
        />

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRIORITIES.map(p => (
            <FilterChip key={p} label={p.charAt(0).toUpperCase() + p.slice(1)}
              active={filters.priority === p}
              onClick={() => setFilters(f => ({ ...f, priority: f.priority === p ? '' : p }))}
            />
          ))}
        </div>

        <div style={{ height: 20, width: 1, background: 'var(--border)' }} />

        <select
          value={filters.assignee}
          onChange={e => setFilters(f => ({ ...f, assignee: e.target.value }))}
          style={{
            padding: '6px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text-secondary)', fontSize: 12,
            cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
          }}
        >
          <option value="">All assignees</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        {(filters.status || filters.priority || filters.assignee || filters.search) && (
          <button onClick={() => setFilters({ status: '', priority: '', assignee: '', search: '' })}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} onStatusChange={handleStatusChange} />
      ) : (
        <TaskList tasks={tasks} onTaskClick={setSelectedTask} />
      )}

      <TaskModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={handleSaved} />
      {selectedTask && (
        <TaskModal open={!!selectedTask} task={selectedTask} onClose={() => setSelectedTask(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
