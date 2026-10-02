const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

// In production, set FRONTEND_URL to your deployed frontend origin (e.g. https://yourcollege.vercel.app)
// to restrict CORS. Defaults to allowing all origins for easy local/dev use.
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api', require('./routes/content'));

app.get('/api/health', (req, res) => res.json({ ok: true, db: db.USE_PG ? 'postgres' : 'sqlite' }));

module.exports = app;
