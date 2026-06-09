import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Avatar from '../components/common/Avatar';
import { PriorityBadge, StatusBadge, Tag } from '../components/common/Badge';
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import TaskModal from '../components/Tasks/TaskModal';

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      {action}
    </div>
  );
}

function TaskRow({ task, onClick }) {
  const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', cursor: 'pointer', transition: 'all var(--transition)',
      marginBottom: 6,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
    >
      <PriorityBadge priority={task.priority} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {task.title}
      </span>
      {task.due_date && (
        <span style={{ fontSize: 11, color: overdue ? 'var(--danger)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: overdue ? 600 : 400 }}>
          {isToday(new Date(task.due_date)) ? 'Due today' : format(new Date(task.due_date), 'MMM d')}
        </span>
      )}
      <StatusBadge status={task.status} />
    </div>
  );
}

function ActivityItem({ item }) {
  const icons = {
    task_completed: '✅',
    task_created: '➕',
    task_status_changed: '🔄',
    task_commented: '💬',
    announcement: '📢',
  };

  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
        {icons[item.action_type] || '•'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.description}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);

  const load = () => api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { myTasks = [], upcomingDeadlines = [], stats = {}, recentActivity = [] } = data || {};

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)',
            color: '#fff', padding: '9px 18px', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Completed Today" value={stats.completedToday || 0} color="#10b981" icon="✅" />
        <StatCard label="In Progress" value={stats.inProgress || 0} color="#3b82f6" icon="⚡" />
        <StatCard label="To Do" value={stats.todo || 0} color="#f59e0b" icon="📋" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <SectionHeader title={`My Tasks (${myTasks.length})`} action={
            <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View all →</button>
          } />
          {myTasks.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No active tasks — great work! 🎉</p>
            : myTasks.slice(0, 5).map(t => <TaskRow key={t.id} task={t} onClick={() => setSelectedTask(t)} />)
          }
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <SectionHeader title="Upcoming Deadlines" />
          {upcomingDeadlines.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No deadlines this week 🙌</p>
            : upcomingDeadlines.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 40, textAlign: 'center', flexShrink: 0,
                  background: isToday(new Date(t.due_date)) ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                  borderRadius: 8, padding: '4px 6px',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isToday(new Date(t.due_date)) ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1 }}>
                    {format(new Date(t.due_date), 'd')}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {format(new Date(t.due_date), 'MMM')}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.assignee_name || 'Unassigned'}</div>
                </div>
                <PriorityBadge priority={t.priority} />
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
        <SectionHeader title="Recent Activity" action={
          <button onClick={() => navigate('/feed')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View feed →</button>
        } />
        {recentActivity.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity.</p>
          : recentActivity.map(a => <ActivityItem key={a.id} item={a} />)
        }
      </div>

      <TaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => { setCreateOpen(false); load(); }}
      />
      {selectedTask && (
        <TaskModal
          open={!!selectedTask}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSaved={() => { setSelectedTask(null); load(); }}
        />
      )}
    </div>
  );
}
