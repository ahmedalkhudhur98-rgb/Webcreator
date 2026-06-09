import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PriorityBadge, Tag } from '../common/Badge';
import Avatar from '../common/Avatar';
import { format, isPast, isToday } from 'date-fns';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6b7280' },
  { id: 'inprogress', label: 'In Progress', color: '#3b82f6' },
  { id: 'review', label: 'Review', color: '#8b5cf6' },
  { id: 'done', label: 'Done', color: '#10b981' },
];

function KanbanCard({ task, index, onClick }) {
  const overdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          style={{
            ...provided.draggableProps.style,
            background: snapshot.isDragging ? 'var(--bg-hover)' : 'var(--bg-card)',
            border: `1px solid ${snapshot.isDragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            marginBottom: 10,
            cursor: 'pointer',
            boxShadow: snapshot.isDragging ? '0 8px 30px rgba(59,130,246,0.2)' : 'var(--shadow)',
            transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(1.5deg)` : provided.draggableProps.style?.transform,
            transition: snapshot.isDragging ? 'none' : 'box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { if (!snapshot.isDragging) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
          onMouseLeave={e => { if (!snapshot.isDragging) e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1, margin: 0 }}>{task.title}</p>
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 10px' }}>
              {task.description}
            </p>
          )}

          {task.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {task.tags.map(t => <Tag key={t} label={t} />)}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            {task.assignee_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={task.assignee_name} color={task.assignee_color} size={22} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.assignee_name.split(' ')[0]}</span>
              </div>
            ) : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>}

            {task.due_date && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: overdue ? 'var(--danger)' : isToday(new Date(task.due_date)) ? 'var(--warning)' : 'var(--text-muted)',
                background: overdue ? 'var(--danger-dim)' : isToday(new Date(task.due_date)) ? 'var(--warning-dim)' : 'transparent',
                padding: overdue || isToday(new Date(task.due_date)) ? '1px 7px' : '0',
                borderRadius: 10,
              }}>
                {isToday(new Date(task.due_date)) ? 'Today' : format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard({ tasks, onTaskClick, onStatusChange }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    if (destination.droppableId !== result.source.droppableId) {
      onStatusChange(parseInt(draggableId), destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
        {COLUMNS.map(col => (
          <div key={col.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '0 2px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                background: grouped[col.id].length > 0 ? col.color + '20' : 'var(--bg-tertiary)',
                color: grouped[col.id].length > 0 ? col.color : 'var(--text-muted)',
                padding: '1px 7px', borderRadius: 10,
              }}>{grouped[col.id].length}</span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    minHeight: 80,
                    background: snapshot.isDraggingOver ? col.color + '08' : 'transparent',
                    borderRadius: 'var(--radius-lg)',
                    border: snapshot.isDraggingOver ? `1.5px dashed ${col.color}40` : '1.5px dashed transparent',
                    padding: snapshot.isDraggingOver ? '4px' : '0',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {grouped[col.id].map((task, i) => (
                    <KanbanCard key={task.id} task={task} index={i} onClick={() => onTaskClick(task)} />
                  ))}
                  {provided.placeholder}
                  {grouped[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: 12, borderRadius: 'var(--radius)', border: '1.5px dashed var(--border)', opacity: 0.6 }}>
                      No tasks
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
