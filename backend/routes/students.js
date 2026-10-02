const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Public: basic stats only (no personal data) for the public site
router.get('/stats', asyncHandler(async (req, res) => {
  const total = (await db.one('SELECT COUNT(*) as c FROM students')).c;
  const byDept = await db.many('SELECT department, COUNT(*) as count FROM students GROUP BY department');
  const avgCgpaRow = await db.one('SELECT AVG(cgpa) as avg FROM students');
  const avg = avgCgpaRow && avgCgpaRow.avg != null ? Number(avgCgpaRow.avg) : 0;
  res.json({
    total: Number(total),
    byDept: byDept.map((d) => ({ department: d.department, count: Number(d.count) })),
    avgCgpa: avg ? Number(avg.toFixed(2)) : 0,
  });
}));

// Everything below requires admin auth (any role)
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const { q, department, year } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  if (q) {
    sql += ' AND (name LIKE ? OR roll_no LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (department) {
    sql += ' AND department = ?';
    params.push(department);
  }
  if (year) {
    sql += ' AND year = ?';
    params.push(year);
  }
  sql += ' ORDER BY roll_no';
  const rows = await db.many(sql, params);
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const row = await db.one('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}));

// Full create/edit/delete: Super Admin & Registrar only
router.post('/', requireRole('super_admin', 'registrar'), asyncHandler(async (req, res) => {
  const { roll_no, name, department, year, email, phone, attendance, cgpa, status } = req.body || {};
  if (!roll_no || !name || !department || !year) {
    return res.status(400).json({ error: 'roll_no, name, department, year are required' });
  }
  try {
    const created = await db.one(
      `INSERT INTO students (roll_no, name, department, year, email, phone, attendance, cgpa, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      [roll_no, name, department, year, email || '', phone || '', attendance || 0, cgpa || 0, status || 'Active']
    );
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: /unique/i.test(e.message) ? 'Roll number already exists' : e.message });
  }
}));

router.put('/:id', requireRole('super_admin', 'registrar'), asyncHandler(async (req, res) => {
  const existing = await db.one('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const fields = { ...existing, ...req.body };
  try {
    const updated = await db.one(
      `UPDATE students SET roll_no=?, name=?, department=?, year=?, email=?, phone=?, attendance=?, cgpa=?, status=? WHERE id=? RETURNING *`,
      [fields.roll_no, fields.name, fields.department, fields.year, fields.email, fields.phone, fields.attendance, fields.cgpa, fields.status, req.params.id]
    );
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}));

// Partial academic-only update: Exam Cell (plus Registrar & Super Admin)
router.patch('/:id/academic', requireRole('super_admin', 'registrar', 'exam_cell'), asyncHandler(async (req, res) => {
  const existing = await db.one('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const attendance = req.body.attendance ?? existing.attendance;
  const cgpa = req.body.cgpa ?? existing.cgpa;
  const status = req.body.status ?? existing.status;
  const updated = await db.one(
    'UPDATE students SET attendance=?, cgpa=?, status=? WHERE id=? RETURNING *',
    [attendance, cgpa, status, req.params.id]
  );
  res.json(updated);
}));

router.delete('/:id', requireRole('super_admin', 'registrar'), asyncHandler(async (req, res) => {
  const deleted = await db.one('DELETE FROM students WHERE id = ? RETURNING id', [req.params.id]);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
}));

module.exports = router;
