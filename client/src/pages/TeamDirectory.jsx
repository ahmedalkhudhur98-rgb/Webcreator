import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';

const DEPT_COLORS = {
  engineering: '#3b82f6',
  design: '#8b5cf6',
  marketing: '#f59e0b',
  management: '#10b981',
  sales: '#ef4444',
};

function MemberCard({ member, taskCount, onClick }) {
  const deptColor = DEPT_COLORS[member.department?.toLowerCase()] || '#3b82f6';
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        cursor: 'pointer', transition: 'all var(--transition)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={member.name} color={member.avatar_color} size={48} />
          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: '50%',
            background: member.is_online ? 'var(--success)' : 'var(--border-light)',
            border: '2px solid var(--bg-card)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.job_title || member.role}</div>
          {member.department && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: deptColor + '18', color: deptColor, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>{member.department}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{taskCount}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Tasks</div>
        </div>
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: member.is_online ? 'var(--success)' : 'var(--text-muted)' }}>
            {member.is_online ? 'Online' : 'Offline'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
        </div>
      </div>

      {member.email && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</span>
        </div>
      )}
    </div>
  );
}

export default function TeamDirectory() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/tasks')])
      .then(([u, t]) => { setMembers(u.data); setTasks(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const departments = ['all', ...new Set(members.map(m => m.department).filter(Boolean))];

  const filtered = members.filter(m => {
    if (deptFilter !== 'all' && m.department !== deptFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.job_title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getActiveTasks = (memberId) => tasks.filter(t => t.assignee_id === memberId && t.status !== 'done').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Team Directory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{members.length} team members</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 240,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              style={{
                padding: '7px 14px',
                background: deptFilter === dept ? 'var(--accent)' : 'var(--bg-secondary)',
                border: `1px solid ${deptFilter === dept ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                color: deptFilter === dept ? '#fff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all var(--transition)', textTransform: 'capitalize',
              }}
            >{dept === 'all' ? 'All' : dept}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {filtered.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            taskCount={getActiveTasks(member.id)}
            onClick={() => navigate(`/team/${member.id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div>No members found</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
