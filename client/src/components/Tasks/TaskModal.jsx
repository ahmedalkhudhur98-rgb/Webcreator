import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { PriorityBadge, StatusBadge, Tag } from '../common/Badge';
import { formatDistanceToNow } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', color: 'var(--text-primary)',
  fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
};

export default function TaskModal({ open, onClose, task, onSaved }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', assigneeId: '', priority: 'medium',
    status: 'todo', dueDate: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [fullTask, setFullTask] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data));
  }, []);

  useEffect(() => {
    if (!open) { setError(''); setActiveTab('details'); return; }
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assigneeId: task.assignee_id || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.due_date || '',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : '',
      });
      api.get(`/tasks/${task.id}`).then(r => {
        setFullTask(r.data);
        setComments(r.data.comments || []);
      });
    } else {
      setForm({ title: '', description: '', assigneeId: user?.id || '', priority: 'medium', status: 'todo', dueDate: '', tags: '' });
      setFullTask(null);
      setComments([]);
    }
  }, [open, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true); setError('');
    const payload = {
      ...form,
      assigneeId: form.assigneeId || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      onSaved?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${task.id}`);
    onSaved?.();
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await api.post(`/tasks/${task.id}/comments`, { content: comment });
    setComments(c => [...c, res.data]);
    setComment('');
  };

  const tabStyle = (active) => ({
    padding: '8px 14px', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
    transition: 'all var(--transition)', fontFamily: 'inherit',
  });

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'New Task'} width={600}>
      {task && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20, marginTop: -8 }}>
          <button style={tabStyle(activeTab === 'details')} onClick={() => setActiveTab('details')}>Details</button>
          <button style={tabStyle(activeTab === 'comments')} onClick={() => setActiveTab('comments')}>
            Comments {comments.length > 0 && `(${comments.length})`}
          </button>
        </div>
      )}

      {activeTab === 'details' && (
        <form onSubmit={handleSubmit}>
          <FormField label="Title">
            <input
              style={inputStyle}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title..."
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </FormField>

          <FormField label="Description">
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add details, context, or links..."
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Assignee">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.assigneeId}
                onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>

            <FormField label="Due Date">
              <input
                type="date"
                style={{ ...inputStyle, colorScheme: 'dark' }}
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </FormField>
          </div>

          <FormField label="Tags (comma-separated)">
            <input
              style={inputStyle}
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="ML, Backend, Client..."
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </FormField>

          {error && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 14, background: 'var(--danger-dim)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            {task ? (
              <button type="button" onClick={handleDelete}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 13, cursor: 'pointer', padding: '8px 4px', fontFamily: 'inherit', fontWeight: 500 }}>
                Delete task
              </button>
            ) : <div />}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading}
                style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'comments' && (
        <div>
          <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No comments yet</p>}
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                <Avatar name={c.author_name} color={c.author_color} size={30} />
                <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', padding: '10px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{c.author_name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
            <button type="submit"
              style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Post
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
