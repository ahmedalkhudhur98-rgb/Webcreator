import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import { PriorityBadge, Tag } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { format, isPast, isToday } from 'date-fns';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#8b93a8' },
  { id: 'inprogress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review', label: 'Review', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#10b981' },
];

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const emptyForm = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '', tags: '', assignee_id: '' };

function TaskCard({ task, members, onClick, index }) {
  const assignee = members.find(m => m.id === task.assignee_id);
  const due = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = due && isPast(due) && task.status !== 'done';
  const isDueToday = due && isToday(due);

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          style={{
            background: snapshot.isDragging ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
            border: `1px solid ${snapshot.isDragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
            marginBottom: 8,
            cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
            userSelect: 'none',
            ...provided.draggableProps.style,
          }}
          onMouseEnter={e => { if (!snapshot.isDragging) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
          onMouseLeave={e => { if (!snapshot.isDragging) e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
          {task.description && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            <PriorityBadge priority={task.priority} />
            {task.tags && task.tags.split(',').filter(Boolean).map(t => <Tag key={t} label={t.trim()} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {assignee ? <Avatar name={assignee.name} color={assignee.avatar_color} size={22} /> : <span />}
            {due && (
              <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? 'var(--danger)' : isDueToday ? 'var(--warning)' : 'var(--text-muted)' }}>
                {isOverdue ? '⚠ ' : ''}{format(due, 'MMM d')}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

function TaskForm({ form, setForm, members, onSubmit, onDelete, loading, isEdit }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)',
    fontSize: 13, outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>Title *</label>
        <input required style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Priority</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Assignee</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }} value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Tags (comma-separated)</label>
        <input style={inputStyle} placeholder="design, frontend, api" value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 4 }}>
        {isEdit && onDelete ? (
          <Button variant="danger" size="sm" type="button" onClick={onDelete}>Delete</Button>
        ) : <span />}
        <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create Task'}</Button>
      </div>
    </form>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    Promise.all([api.get('/tasks'), api.get('/users')])
      .then(([t, u]) => { setTasks(t.data); setMembers(u.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditTask(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title, description: task.description || '',
      priority: task.priority, status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      tags: task.tags || '', assignee_id: task.assignee_id || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, assignee_id: form.assignee_id || null, due_date: form.due_date || null };
      if (editTask) {
        const res = await api.put(`/tasks/${editTask.id}`, payload);
        setTasks(ts => ts.map(t => t.id === editTask.id ? res.data : t));
      } else {
        const res = await api.post('/tasks', payload);
        setTasks(ts => [...ts, res.data]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!editTask || !window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${editTask.id}`);
      setTasks(ts => ts.filter(t => t.id !== editTask.id));
      setModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try { await api.put(`/tasks/${taskId}`, { status: newStatus }); }
    catch (err) { console.error(err); load(); }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'mine' && t.assignee_id !== user?.id) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getColumnTasks = (colId) => filteredTasks.filter(t => t.status === colId);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{tasks.length} total tasks across the team</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 200,
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {['all', 'mine'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px', background: filter === f ? 'var(--accent)' : 'none',
                  border: 'none', color: filter === f ? '#fff' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {f === 'all' ? 'All Tasks' : 'My Tasks'}
              </button>
            ))}
          </div>
          <Button onClick={openNew}>+ New Task</Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.id);
            return (
              <div key={col.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{col.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: col.color, background: col.color + '22', padding: '1px 7px', borderRadius: 10 }}>{colTasks.length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: '10px 10px',
                        minHeight: 80,
                        background: snapshot.isDraggingOver ? 'rgba(59,130,246,0.04)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {colTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} members={members} index={index} onClick={() => openEdit(task)} />
                      ))}
                      {provided.placeholder}
                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '16px 0' }}>Drop here</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <TaskForm
          form={form} setForm={setForm} members={members}
          onSubmit={handleSubmit} onDelete={handleDelete}
          loading={saving} isEdit={!!editTask}
        />
      </Modal>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
