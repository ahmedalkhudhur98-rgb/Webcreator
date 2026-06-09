import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import { PriorityBadge, StatusBadge, Tag } from '../components/common/Badge';
import TaskModal from '../components/Tasks/TaskModal';
import { format } from 'date-fns';

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);

  const load = () => api.get(`/users/${id}`).then(r => { setProfile(r.data); setLoading(false); });

  useEffect(() => { load(); }, [id]);

  const isMe = me?.id === parseInt(id);
  const canEdit = isMe || me?.role === 'admin';

  const startEdit = () => {
    setEditForm({ name: profile.name, email: profile.email || '', bio: profile.bio || '', skills: profile.skills?.join(', ') || '' });
    setEditing(true);
  };

  const saveEdit = async () => {
    await api.put(`/users/${id}`, {
      name: editForm.name,
      email: editForm.email,
      bio: editForm.bio,
      skills: editForm.skills ? editForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    });
    setEditing(false);
    load();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)',
    fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800 }}>
      <button onClick={() => navigate('/team')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', fontWeight: 500, padding: 0 }}>
        ← Back to Team
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <Avatar name={profile.name} color={profile.avatar_color} size={72} />
            <div>
              {editing ? (
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  style={{ ...inputStyle, fontSize: 20, fontWeight: 700, marginBottom: 8, width: 260 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              ) : (
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{profile.name}</h1>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, textTransform: 'capitalize',
                  background: profile.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'var(--accent-dim)',
                  color: profile.role === 'admin' ? '#f59e0b' : 'var(--accent)',
                }}>{profile.role}</span>
                {profile.email && !editing && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{profile.email}</span>}
              </div>
              {editing && (
                <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email" style={{ ...inputStyle, marginTop: 8, width: 280 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              )}
            </div>
          </div>
          {canEdit && !editing && (
            <button onClick={startEdit} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Edit Profile
            </button>
          )}
          {editing && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(false)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={saveEdit} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bio</div>
            {editing ? (
              <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
                placeholder="Tell the team about yourself..."
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {profile.bio || <em style={{ color: 'var(--text-muted)' }}>No bio added yet.</em>}
              </p>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Skills</div>
            {editing ? (
              <input value={editForm.skills} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))}
                style={inputStyle} placeholder="React, Python, AI Strategy..."
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.skills?.length > 0
                  ? profile.skills.map(s => <Tag key={s} label={s} />)
                  : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills added.</span>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Active Tasks ({profile.activeTasks?.length || 0})
        </h2>
        {profile.activeTasks?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active tasks right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.activeTasks?.map(t => (
              <div key={t.id} onClick={() => setSelectedTask(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', cursor: 'pointer', transition: 'all var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <PriorityBadge priority={t.priority} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</span>
                <StatusBadge status={t.status} />
                {t.due_date && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(t.due_date), 'MMM d')}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal open={!!selectedTask} task={selectedTask} onClose={() => setSelectedTask(null)} onSaved={() => { setSelectedTask(null); load(); }} />
      )}
    </div>
  );
}
