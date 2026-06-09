import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';

const ACTION_ICONS = {
  task_completed: { icon: '✅', color: '#10b981' },
  task_created: { icon: '➕', color: '#3b82f6' },
  task_status_changed: { icon: '🔄', color: '#8b5cf6' },
  task_commented: { icon: '💬', color: '#f59e0b' },
  announcement: { icon: '📢', color: '#ef4444' },
};

function AnnouncementCard({ ann, isAdmin, onPin, onDelete }) {
  return (
    <div style={{
      background: ann.pinned ? 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04))' : 'var(--bg-card)',
      border: `1px solid ${ann.pinned ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar name={ann.user_name} color={ann.user_color} size={32} />
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ann.user_name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
            {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {ann.pinned && (
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 10 }}>📌 Pinned</span>
          )}
          {isAdmin && (
            <>
              <button onClick={() => onPin(ann.id)}
                style={{ background: 'none', border: 'none', color: ann.pinned ? 'var(--accent)' : 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontWeight: 500 }}>
                {ann.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={() => onDelete(ann.id)}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontWeight: 500 }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{ann.content}</p>
    </div>
  );
}

function ActivityCard({ item }) {
  const style = ACTION_ICONS[item.action_type] || { icon: '•', color: 'var(--text-muted)' };
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={item.user_name} color={item.user_color} size={36} />
        <span style={{
          position: 'absolute', bottom: -2, right: -2,
          background: 'var(--bg-secondary)', borderRadius: '50%',
          width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, border: '1.5px solid var(--bg-secondary)',
        }}>
          {style.icon}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 4px' }}>{item.description}</p>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [data, setData] = useState({ activities: [], announcements: [] });
  const [loading, setLoading] = useState(true);
  const [newAnn, setNewAnn] = useState('');
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const load = () => api.get('/feed').then(r => { setData(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const postAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnn.trim()) return;
    setPosting(true);
    await api.post('/feed/announcements', { content: newAnn, pinned });
    setNewAnn(''); setPinned(false);
    setPosting(false);
    load();
  };

  const handlePin = async (id) => {
    await api.put(`/feed/announcements/${id}/pin`);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`/feed/announcements/${id}`);
    load();
  };

  const tabStyle = (active) => ({
    padding: '8px 16px', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all var(--transition)',
  });

  const pinnedAnns = data.announcements.filter(a => a.pinned);
  const allAnns = data.announcements;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Team Feed</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Announcements, updates, and team activity</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', marginBottom: 24 }}>
        <form onSubmit={postAnnouncement}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <Avatar name={user?.name} color={user?.avatar_color} size={36} />
            <textarea
              value={newAnn}
              onChange={e => setNewAnn(e.target.value)}
              placeholder="Share an update with the team..."
              style={{
                flex: 1, minHeight: 72, padding: '10px 14px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', color: 'var(--text-primary)',
                fontSize: 13.5, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 48 }}>
            {user?.role === 'admin' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                Pin announcement
              </label>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={posting || !newAnn.trim()}
                style={{
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 13,
                  fontWeight: 600, cursor: posting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: posting || !newAnn.trim() ? 0.6 : 1,
                }}>
                {posting ? 'Posting…' : 'Post Update'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {pinnedAnns.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Pinned</div>
          {pinnedAnns.map(a => (
            <AnnouncementCard key={a.id} ann={a} isAdmin={user?.role === 'admin'} onPin={handlePin} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <button style={tabStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>All Activity</button>
        <button style={tabStyle(activeTab === 'announcements')} onClick={() => setActiveTab('announcements')}>Announcements</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : activeTab === 'all' ? (
        <div>
          {data.activities.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No activity yet.</p>
            : data.activities.map(a => <ActivityCard key={a.id} item={a} />)
          }
        </div>
      ) : (
        <div>
          {allAnns.filter(a => !a.pinned).length === 0 && pinnedAnns.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No announcements yet.</p>
            : allAnns.filter(a => !a.pinned).map(a => (
              <AnnouncementCard key={a.id} ann={a} isAdmin={user?.role === 'admin'} onPin={handlePin} onDelete={handleDelete} />
            ))
          }
        </div>
      )}
    </div>
  );
}
