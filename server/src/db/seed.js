const db = require('./index');
const bcrypt = require('bcryptjs');

const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (existingUsers.count > 0) {
  console.log('Database already seeded.');
  process.exit(0);
}

const hash = (pw) => bcrypt.hashSync(pw, 10);

const insertUser = db.prepare(`
  INSERT INTO users (username, password_hash, name, role, email, bio, skills, avatar_color)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const users = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Sarah Al-Khalifa',
    role: 'admin',
    email: 'sarah@aiteam.bh',
    bio: 'Team lead and AI solutions architect. Passionate about building intelligent systems.',
    skills: JSON.stringify(['AI Strategy', 'Project Management', 'Python', 'LLMs']),
    avatarColor: '#3b82f6',
  },
  {
    username: 'omar',
    password: 'omar123',
    name: 'Omar Hussain',
    role: 'member',
    email: 'omar@aiteam.bh',
    bio: 'Full-stack developer focused on AI integrations and API development.',
    skills: JSON.stringify(['React', 'Node.js', 'Python', 'REST APIs', 'Docker']),
    avatarColor: '#8b5cf6',
  },
  {
    username: 'layla',
    password: 'layla123',
    name: 'Layla Mansoor',
    role: 'member',
    email: 'layla@aiteam.bh',
    bio: 'Data scientist and ML engineer. Loves turning messy data into clean insights.',
    skills: JSON.stringify(['Machine Learning', 'Python', 'Data Analysis', 'TensorFlow', 'SQL']),
    avatarColor: '#10b981',
  },
];

const insertUserStmt = db.transaction(() => {
  for (const u of users) {
    insertUser.run(u.username, hash(u.password), u.name, u.role, u.email, u.bio, u.skills, u.avatarColor);
  }
});
insertUserStmt();

const getUser = (username) => db.prepare('SELECT id FROM users WHERE username = ?').get(username);
const adminId = getUser('admin').id;
const omarId = getUser('omar').id;
const laylaId = getUser('layla').id;

const insertTask = db.prepare(`
  INSERT INTO tasks (title, description, assignee_id, created_by, priority, status, due_date, tags, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
`);

const tasks = [
  {
    title: 'Set up CI/CD pipeline for ML model deployment',
    description: 'Configure GitHub Actions to auto-deploy the fraud detection model to staging when PRs are merged.',
    assigneeId: omarId, createdBy: adminId, priority: 'high', status: 'inprogress',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['DevOps', 'ML']), offset: '-2 days',
  },
  {
    title: 'Client presentation: Q3 AI roadmap',
    description: 'Prepare slide deck and demo environment for the client meeting. Include ROI projections and model performance metrics.',
    assigneeId: adminId, createdBy: adminId, priority: 'urgent', status: 'inprogress',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['Client', 'Presentation']), offset: '-1 days',
  },
  {
    title: 'Fine-tune sentiment analysis model on Arabic text',
    description: 'The current model underperforms on Gulf Arabic dialect. Collect training data and fine-tune using the new dataset.',
    assigneeId: laylaId, createdBy: adminId, priority: 'high', status: 'todo',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['ML', 'NLP', 'Arabic']), offset: '0 hours',
  },
  {
    title: 'API rate limiting & auth hardening',
    description: 'Implement rate limiting on all public endpoints. Add refresh token rotation and audit logging.',
    assigneeId: omarId, createdBy: omarId, priority: 'medium', status: 'todo',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['Security', 'Backend']), offset: '0 hours',
  },
  {
    title: 'Document LLM integration patterns',
    description: 'Write internal documentation covering prompt engineering best practices, token optimization, and error handling for our LLM integrations.',
    assigneeId: laylaId, createdBy: adminId, priority: 'low', status: 'review',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['Documentation', 'LLMs']), offset: '-3 days',
  },
  {
    title: 'Onboard new data pipeline to production',
    description: 'The ETL pipeline for the banking client is ready. Coordinate with ops for production cutover.',
    assigneeId: omarId, createdBy: adminId, priority: 'urgent', status: 'done',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['Data', 'Production']), offset: '-5 days',
  },
  {
    title: 'Weekly team sync notes',
    description: 'Compile and distribute notes from the weekly team sync meeting.',
    assigneeId: adminId, createdBy: adminId, priority: 'low', status: 'done',
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    tags: JSON.stringify(['Admin']), offset: '-7 days',
  },
];

const insertTaskStmt = db.transaction(() => {
  for (const t of tasks) {
    insertTask.run(t.title, t.description, t.assigneeId, t.createdBy, t.priority, t.status, t.dueDate, t.tags, t.offset, t.offset);
    if (t.status === 'done') {
      const taskId = db.prepare('SELECT id FROM tasks WHERE title = ?').get(t.title).id;
      db.prepare("UPDATE tasks SET completed_at = datetime('now') WHERE id = ?").run(taskId);
    }
  }
});
insertTaskStmt();

const insertAnnouncement = db.prepare(`
  INSERT INTO announcements (user_id, content, pinned) VALUES (?, ?, ?)
`);
insertAnnouncement.run(adminId, '🎉 Welcome to the team portal! Use this space for task coordination and team updates. Reach out if you have any questions.', 1);
insertAnnouncement.run(adminId, 'Reminder: Client demo is coming up. Please make sure your deliverables are in the review stage by EOD tomorrow.', 0);

const insertActivity = db.prepare(`
  INSERT INTO activity_feed (user_id, action_type, entity_type, entity_id, description, created_at)
  VALUES (?, ?, ?, ?, ?, datetime('now', ?))
`);

const completedTask = db.prepare("SELECT id FROM tasks WHERE status = 'done' LIMIT 1").get();
if (completedTask) {
  insertActivity.run(omarId, 'task_completed', 'task', completedTask.id, 'Omar completed "Onboard new data pipeline to production"', '-2 hours');
}
insertActivity.run(adminId, 'task_created', 'task', 1, 'Sarah created "Client presentation: Q3 AI roadmap"', '-1 days');
insertActivity.run(laylaId, 'task_status_changed', 'task', 5, 'Layla moved "Document LLM integration patterns" to Review', '-4 hours');
insertActivity.run(adminId, 'announcement', 'announcement', 1, 'Sarah posted an announcement', '-2 days');

console.log('✅ Database seeded successfully!');
console.log('   Users: admin (admin123), omar (omar123), layla (layla123)');
