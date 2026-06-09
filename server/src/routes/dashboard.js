const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const userId = req.user.id;

  const myTasks = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.assignee_id = ? AND t.status != 'done'
    ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, t.due_date ASC
  `).all(userId);

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const upcomingDeadlines = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_color, c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    LEFT JOIN users c ON t.created_by = c.id
    WHERE t.due_date >= ? AND t.due_date <= ? AND t.status != 'done'
    ORDER BY t.due_date ASC
    LIMIT 10
  `).all(today, nextWeek);

  const todayCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM tasks WHERE date(completed_at) = date('now')
  `).get();

  const inProgressCount = db.prepare(`
    SELECT COUNT(*) as count FROM tasks WHERE status = 'inprogress'
  `).get();

  const todoCount = db.prepare(`
    SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'
  `).get();

  const recentActivity = db.prepare(`
    SELECT af.*, u.name as user_name, u.avatar_color as user_color
    FROM activity_feed af JOIN users u ON af.user_id = u.id
    ORDER BY af.created_at DESC LIMIT 8
  `).all();

  res.json({
    myTasks: myTasks.map(t => ({ ...t, tags: JSON.parse(t.tags || '[]') })),
    upcomingDeadlines: upcomingDeadlines.map(t => ({ ...t, tags: JSON.parse(t.tags || '[]') })),
    stats: {
      completedToday: todayCompleted.count,
      inProgress: inProgressCount.count,
      todo: todoCount.count,
    },
    recentActivity,
  });
});

module.exports = router;
