// Traditional server entry point (for Render, Railway, a VPS, etc.)
// For Vercel serverless deployment, see api/index.js instead.
const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 4000;

db.init()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`College backend API running on port ${PORT} (db: ${db.USE_PG ? 'postgres' : 'sqlite'})`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
