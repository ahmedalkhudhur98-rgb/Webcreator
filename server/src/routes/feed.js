const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const activities = db.prepare(`
    SELECT af.*, u.name as user_name, u.avatar_color as user_color
    FROM activity_feed af
    JOIN users u ON af.user_id = u.id
    ORDER BY af.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const announcements = db.prepare(`
    SELECT an.*, u.name as user_name, u.avatar_color as user_color
    FROM announcements an
    JOIN users u ON an.user_id = u.id
    ORDER BY an.pinned DESC, an.created_at DESC
    LIMIT 10
  `).all();

  res.json({ activities, announcements });
});

router.post('/announcements', (req, res) => {
  const { content, pinned } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const result = db.prepare(`
    INSERT INTO announcements (user_id, content, pinned) VALUES (?, ?, ?)
  `).run(req.user.id, content, pinned ? 1 : 0);

  db.prepare(`
    INSERT INTO activity_feed (user_id, action_type, entity_type, entity_id, description)
    VALUES (?, 'announcement', 'announcement', ?, ?)
  `).run(req.user.id, result.lastInsertRowid, `${req.user.name} posted an announcement`);

  const announcement = db.prepare(`
    SELECT an.*, u.name as user_name, u.avatar_color as user_color
    FROM announcements an JOIN users u ON an.user_id = u.id
    WHERE an.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(announcement);
});

router.put('/announcements/:id/pin', (req, res) => {
  const ann = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!ann) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.prepare('UPDATE announcements SET pinned = ? WHERE id = ?').run(ann.pinned ? 0 : 1, req.params.id);
  res.json({ pinned: !ann.pinned });
});

router.delete('/announcements/:id', (req, res) => {
  const ann = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  if (!ann) return res.status(404).json({ error: 'Not found' });
  if (ann.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
