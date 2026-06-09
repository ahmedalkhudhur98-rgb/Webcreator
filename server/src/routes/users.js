const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, username, name, role, email, bio, skills, avatar_color, created_at FROM users').all();
  const parsed = users.map(u => ({ ...u, skills: JSON.parse(u.skills || '[]') }));
  res.json(parsed);
});

router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, username, name, role, email, bio, skills, avatar_color, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.skills = JSON.parse(user.skills || '[]');

  const tasks = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color, c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.created_by = c.id
    WHERE t.assignee_id = ? AND t.status != 'done'
    ORDER BY t.due_date ASC
  `).all(req.params.id);

  const parsedTasks = tasks.map(t => ({ ...t, tags: JSON.parse(t.tags || '[]') }));
  res.json({ ...user, activeTasks: parsedTasks });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Cannot edit another user\'s profile' });
  }
  const { name, email, bio, skills } = req.body;
  db.prepare(`
    UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email),
    bio = COALESCE(?, bio), skills = COALESCE(?, skills)
    WHERE id = ?
  `).run(name, email, bio, skills ? JSON.stringify(skills) : null, id);

  const updated = db.prepare('SELECT id, username, name, role, email, bio, skills, avatar_color FROM users WHERE id = ?').get(id);
  updated.skills = JSON.parse(updated.skills || '[]');
  res.json(updated);
});

router.post('/', adminOnly, (req, res) => {
  const { username, password, name, role, email, bio, skills, avatarColor } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'username, password, name required' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, name, role, email, bio, skills, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(username, hash, name, role || 'member', email, bio, JSON.stringify(skills || []), avatarColor || '#3b82f6');
    const user = db.prepare('SELECT id, username, name, role, email, bio, skills, avatar_color FROM users WHERE id = ?').get(result.lastInsertRowid);
    user.skills = JSON.parse(user.skills || '[]');
    res.status(201).json(user);
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username already exists' });
    throw e;
  }
});

router.delete('/:id', adminOnly, (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
