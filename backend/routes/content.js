const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/courses', asyncHandler(async (req, res) => {
  res.json(await db.many('SELECT * FROM courses ORDER BY id'));
}));

router.get('/faculty', asyncHandler(async (req, res) => {
  res.json(await db.many('SELECT * FROM faculty ORDER BY id'));
}));

router.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }
  await db.many('INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject || '', message]);
  res.status(201).json({ success: true });
}));

router.get('/messages', requireAuth, requireRole('super_admin', 'registrar'), asyncHandler(async (req, res) => {
  res.json(await db.many('SELECT * FROM messages ORDER BY created_at DESC'));
}));

module.exports = router;
