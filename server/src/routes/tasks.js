const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

function logActivity(userId, actionType, entityType, entityId, description) {
  db.prepare(`
    INSERT INTO activity_feed (user_id, action_type, entity_type, entity_id, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, actionType, entityType, entityId, description);
}

function enrichTask(task) {
  if (!task) return null;
  return { ...task, tags: JSON.parse(task.tags || '[]') };
}

const taskQuery = `
  SELECT t.*,
    a.name as assignee_name, a.avatar_color as assignee_color,
    c.name as creator_name
  FROM tasks t
  LEFT JOIN users a ON t.assignee_id = a.id
  LEFT JOIN users c ON t.created_by = c.id
`;

router.get('/', (req, res) => {
  const { status, priority, assignee, tag, search } = req.query;
  let query = taskQuery + ' WHERE 1=1';
  const params = [];

  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
  if (assignee) { query += ' AND t.assignee_id = ?'; params.push(parseInt(assignee)); }
  if (tag) { query += ' AND t.tags LIKE ?'; params.push(`%"${tag}"%`); }
  if (search) { query += ' AND (t.title LIKE ? OR t.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json(tasks.map(enrichTask));
});

router.get('/:id', (req, res) => {
  const task = db.prepare(taskQuery + ' WHERE t.id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const comments = db.prepare(`
    SELECT tc.*, u.name as author_name, u.avatar_color as author_color
    FROM task_comments tc JOIN users u ON tc.user_id = u.id
    WHERE tc.task_id = ? ORDER BY tc.created_at ASC
  `).all(req.params.id);

  res.json({ ...enrichTask(task), comments });
});

router.post('/', (req, res) => {
  const { title, description, assigneeId, priority, status, dueDate, tags } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const result = db.prepare(`
    INSERT INTO tasks (title, description, assignee_id, created_by, priority, status, due_date, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, assigneeId || null, req.user.id, priority || 'medium', status || 'todo', dueDate || null, JSON.stringify(tags || []));

  const task = db.prepare(taskQuery + ' WHERE t.id = ?').get(result.lastInsertRowid);
  logActivity(req.user.id, 'task_created', 'task', task.id, `${req.user.name} created "${task.title}"`);
  res.status(201).json(enrichTask(task));
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const { title, description, assigneeId, priority, status, dueDate, tags } = req.body;

  const completedAt = status === 'done' && existing.status !== 'done'
    ? new Date().toISOString()
    : (status !== 'done' ? null : existing.completed_at);

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      assignee_id = ?,
      priority = COALESCE(?, priority),
      status = COALESCE(?, status),
      due_date = ?,
      tags = COALESCE(?, tags),
      completed_at = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title, description,
    assigneeId !== undefined ? (assigneeId || null) : existing.assignee_id,
    priority, status,
    dueDate !== undefined ? dueDate : existing.due_date,
    tags ? JSON.stringify(tags) : null,
    completedAt, id
  );

  if (status && status !== existing.status) {
    const label = status === 'done' ? 'completed' : `moved to ${status}`;
    logActivity(req.user.id, status === 'done' ? 'task_completed' : 'task_status_changed', 'task', id,
      `${req.user.name} ${label} "${existing.title}"`);
  }

  const updated = db.prepare(taskQuery + ' WHERE t.id = ?').get(id);
  res.json(enrichTask(updated));
});

router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this task' });
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.post('/:id/comments', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  const task = db.prepare('SELECT id, title FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const result = db.prepare(`
    INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)
  `).run(req.params.id, req.user.id, content);

  logActivity(req.user.id, 'task_commented', 'task', req.params.id,
    `${req.user.name} commented on "${task.title}"`);

  const comment = db.prepare(`
    SELECT tc.*, u.name as author_name, u.avatar_color as author_color
    FROM task_comments tc JOIN users u ON tc.user_id = u.id
    WHERE tc.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(comment);
});

module.exports = router;
