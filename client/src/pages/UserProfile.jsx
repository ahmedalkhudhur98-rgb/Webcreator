import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import { PriorityBadge, StatusBadge, Tag } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { format } from 'date-fns';

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'];

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuth();
  const [member, setMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(id);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    Promise.all([api.get(`/users/${id}`), api.get(`/tasks?assignee=${id}`)])
      .then(([u, t]) => { setMember(u.data); setTasks(t.data); })
      .catch(() => navigate('/team'))
      .finally(() => setLoading(false));
  }, [id]);

  const openEdit = () => {
    setForm({
      name: member.name, email: member.email || '',
      job_title: member.job_title || '', department: member.department || '',
      bio: member.bio || '', avatar_color: member.avatar_color || '#3b82f6',
    });
    setEditOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/users/${id}`, form);
      setMember(res.data);
      if (isOwnProfile) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
      setEditOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!member) return null;

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const inProgressTasks = tasks.filter(t => t.status === 'inprogress');

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/team')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Team
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar name={member.name} color={member.avatar_color} size={80} />
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: member.is_online ? 'var(--success)' : 'var(--border-light)',
                border: '2.5px solid var(--bg-card)',
              }} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{member.name}</h1>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>{member.job_title || 'Team Member'}</div>
            {member.department && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: 'var(--accent-dim)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{member.department}</span>
            )}
            {member.bio && (
              <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'left' }}>{member.bio}</p>
            )}
            {member.email && (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {member.email}
              </div>
            )}
            {(isOwnProfile || isAdmin) && (
              <Button variant="secondary" size="sm" style={{ marginTop: 18, width: '100%' }} onClick={openEdit}>Edit Profile</Button>
            )}
          </div>

          {/* Stats */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Task Stats</h2>
            {[
              { label: 'Active Tasks', value: activeTasks.length, color: 'var(--accent)' },
              { label: 'In Progress', value: inProgressTasks.length, color: 'var(--purple)' },
              { label: 'Completed', value: doneTasks.length, color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tasks */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Assigned Tasks</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{tasks.length} tasks total</p>
          </div>
          {tasks.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              <div>No tasks assigned yet</div>
            </div>
          ) : (
            <div>
              {tasks.map((task, i) => (
                <div key={task.id} style={{
                  padding: '14px 22px',
                  borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background var(--transition)',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{task.description}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.tags && task.tags.split(',').filter(Boolean).map(t => <Tag key={t} label={t.trim()} />)}
                      </div>
                    </div>
                    {task.due_date && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>
                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input required style={inputStyle} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Job Title</label>
              <input style={inputStyle} value={form.job_title || ''} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <input style={inputStyle} value={form.department || ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={labelStyle}>Avatar Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, avatar_color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                    cursor: 'pointer', outline: form.avatar_color === c ? `3px solid ${c}` : '3px solid transparent',
                    outlineOffset: 2, transition: 'outline 0.15s',
                  }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
