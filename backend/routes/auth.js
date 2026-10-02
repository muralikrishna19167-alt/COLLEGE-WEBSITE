const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const admin = await db.one('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = bcrypt.compareSync(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: admin.id, username: admin.username, name: admin.name, role: admin.role, department: admin.department },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, name: admin.name, username: admin.username, role: admin.role, department: admin.department });
}));

router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

// --- Admin account management (super_admin only) ---
router.get('/admins', requireAuth, requireRole('super_admin'), asyncHandler(async (req, res) => {
  const admins = await db.many('SELECT id, username, name, role, department FROM admins ORDER BY id');
  res.json(admins);
}));

router.post('/admins', requireAuth, requireRole('super_admin'), asyncHandler(async (req, res) => {
  const { username, password, name, role, department } = req.body || {};
  const allowedRoles = ['super_admin', 'registrar', 'exam_cell'];
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'username, password, name and role are required' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${allowedRoles.join(', ')}` });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    const created = await db.one(
      'INSERT INTO admins (username, password_hash, name, role, department) VALUES (?, ?, ?, ?, ?) RETURNING id, username, name, role, department',
      [username, hash, name, role, department || null]
    );
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: /unique/i.test(e.message) ? 'Username already exists' : e.message });
  }
}));

router.delete('/admins/:id', requireAuth, requireRole('super_admin'), asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.admin.id) {
    return res.status(400).json({ error: 'You cannot delete your own account while logged in' });
  }
  const deleted = await db.one('DELETE FROM admins WHERE id = ? RETURNING id', [req.params.id]);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
}));

module.exports = router;
