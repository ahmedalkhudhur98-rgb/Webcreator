import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import { Tag } from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

function PingModal({ open, onClose, target }) {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (open && target) setMsg(`Hey ${target.name.split(' ')[0]}, `);
  }, [open, target]);

  return (
    <Modal open={open} onClose={onClose} title={`Ping ${target?.name}`} width={420}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        This opens a pre-filled message for internal team communication.
      </p>
      <textarea
        value={msg}
        onChange={e => setMsg(e.target.value)}
        style={{
          width: '100%', minHeight: 100, padding: '10px 12px',
          background: 'var(--bg-tertiary)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 13,
          resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
          Cancel
        </button>
        <button onClick={() => { alert(`Message to ${target?.email || target?.name}:\n"${msg}"`); onClose(); }}
          style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 'var(--radius)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
          Send Ping
        </button>
      </div>
    </Modal>
  );
}

function MemberCard({ member, onPing, onClick }) {
  const ROLE_COLORS = { admin: '#f59e0b', member: '#3b82f6' };

  return (
    <div
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 16,
        transition: 'all var(--transition)', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={member.name} color={member.avatar_color} size={52} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{member.name}</div>
          <span style={{ fontSize: 11, fontWeight: 600, background: ROLE_COLORS[member.role] + '18', color: ROLE_COLORS[member.role], padding: '2px 9px', borderRadius: 10, textTransform: 'capitalize' }}>
            {member.role}
          </span>
        </div>
      </div>

      {member.bio && (
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
          {member.bio}
        </p>
      )}

      {member.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {member.skills.slice(0, 4).map(s => <Tag key={s} label={s} />)}
          {member.skills.length > 4 && <Tag label={`+${member.skills.length - 4}`} />}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        {member.email && (
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {member.email}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onPing(member); }}
          style={{
            background: 'var(--accent-dim)', border: '1px solid rgba(59,130,246,0.25)',
            color: 'var(--accent)', padding: '5px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all var(--transition)', flexShrink: 0, marginLeft: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; }}
        >
          Ping
        </button>
      </div>
    </div>
  );
}

export default function TeamDirectory() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pingTarget, setPingTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users').then(r => { setMembers(r.data); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Team</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{members.length} members · AI Solutions Bahrain</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {members.map(m => (
          <MemberCard
            key={m.id}
            member={m}
            onPing={setPingTarget}
            onClick={() => navigate(`/team/${m.id}`)}
          />
        ))}
      </div>

      <PingModal open={!!pingTarget} onClose={() => setPingTarget(null)} target={pingTarget} />
    </div>
  );
}
