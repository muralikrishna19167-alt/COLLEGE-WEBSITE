// Vercel serverless entry point. Vercel auto-detects files under /api as
// serverless functions and routes matching requests to them (see ../vercel.json).
const app = require('../app');
const db = require('../db');

let initPromise = null;
function ensureInit() {
  if (!initPromise) initPromise = db.init();
  return initPromise;
}

module.exports = async (req, res) => {
  await ensureInit();
  return app(req, res);
};
