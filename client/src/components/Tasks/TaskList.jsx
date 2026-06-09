import React from 'react';
import { PriorityBadge, StatusBadge, Tag } from '../common/Badge';
import Avatar from '../common/Avatar';
import { format, isPast, isToday } from 'date-fns';

export default function TaskList({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
        <p style={{ fontSize: 14, fontWeight: 500 }}>No tasks found</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Adjust your filters or create a new task</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tasks.map(task => {
        const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';
        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              cursor: 'pointer', transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <PriorityBadge priority={task.priority} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 13.5, fontWeight: 600, color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{task.title}</span>
              </div>
              {task.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {task.tags.map(t => <Tag key={t} label={t} />)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <StatusBadge status={task.status} />

              {task.assignee_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={task.assignee_name} color={task.assignee_color} size={24} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.assignee_name.split(' ')[0]}</span>
                </div>
              )}

              {task.due_date && (
                <span style={{
                  fontSize: 12,
                  color: overdue ? 'var(--danger)' : isToday(new Date(task.due_date)) ? 'var(--warning)' : 'var(--text-muted)',
                  fontWeight: overdue ? 600 : 400, minWidth: 50,
                }}>
                  {isToday(new Date(task.due_date)) ? 'Today' : format(new Date(task.due_date), 'MMM d')}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
