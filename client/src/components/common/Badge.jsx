import React from 'react';

const PRIORITY_STYLES = {
  urgent: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444' },
  high: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' },
  medium: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', dot: '#3b82f6' },
  low: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', dot: '#6b7280' },
};

const STATUS_STYLES = {
  todo: { bg: 'rgba(107,114,128,0.1)', color: '#8b93a8' },
  inprogress: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  review: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
  done: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
};

const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', review: 'Review', done: 'Done' };
const PRIORITY_LABELS = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };

export function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.todo;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function Tag({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      background: 'rgba(59,130,246,0.08)', color: '#5a9ff8',
      fontSize: 11, fontWeight: 500, border: '1px solid rgba(59,130,246,0.2)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
