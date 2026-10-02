const path = require('path');
const bcrypt = require('bcryptjs');

const USE_PG = !!process.env.DATABASE_URL;

let allAsync; // (sql, params) => Promise<rows[]>  -- sql always written with '?' placeholders

if (USE_PG) {
  const { Pool } = require('pg');
  // Most managed Postgres providers (Neon, Render, Supabase) require SSL.
  // Set PG_SSL=false for connecting to a plain local/self-hosted Postgres without SSL.
  const useSsl = process.env.PG_SSL !== 'false';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  allAsync = async (sql, params = []) => {
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const result = await pool.query(pgSql, params);
    return result.rows;
  };
} else {
  const Database = require('better-sqlite3');
  const sqliteDb = new Database(path.join(__dirname, 'college.db'));
  sqliteDb.pragma('journal_mode = WAL');

  allAsync = async (sql, params = []) => {
    const stmt = sqliteDb.prepare(sql);
    if (/^\s*(insert|update|delete)/i.test(sql) && !/returning/i.test(sql)) {
      const info = stmt.run(...params);
      return [{ changes: info.changes, lastInsertRowid: info.lastInsertRowid }];
    }
    return stmt.all(...params);
  };
}

async function many(sql, params = []) {
  return allAsync(sql, params);
}

async function one(sql, params = []) {
  const rows = await allAsync(sql, params);
  return rows[0];
}

// --- Schema (dialect differs slightly between SQLite and Postgres) ---
const pgSchema = `
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'registrar',
  department TEXT
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  duration TEXT NOT NULL,
  seats INTEGER NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  qualification TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  roll_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL,
  email TEXT,
  phone TEXT,
  attendance REAL DEFAULT 0,
  cgpa REAL DEFAULT 0,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const sqliteSchema = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'registrar',
  department TEXT
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  duration TEXT NOT NULL,
  seats INTEGER NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  qualification TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  roll_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  year INTEGER NOT NULL,
  email TEXT,
  phone TEXT,
  attendance REAL DEFAULT 0,
  cgpa REAL DEFAULT 0,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

async function execSchema() {
  if (USE_PG) {
    const { Pool } = require('pg');
    // reuse same pool creation logic by re-requiring is wasteful; instead run each statement via allAsync's pool.
    // Split on ';' naively since statements are simple CREATE TABLEs without embedded semicolons.
    const statements = pgSchema.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await many(stmt + ';');
    }
    // Migrate older admins table (added role/department columns later)
    await many(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'registrar'`);
    await many(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS department TEXT`);
  } else {
    const Database = require('better-sqlite3');
    const sqliteDb = new Database(path.join(__dirname, 'college.db'));
    sqliteDb.exec(sqliteSchema);
    const adminCols = sqliteDb.prepare('PRAGMA table_info(admins)').all().map((c) => c.name);
    if (!adminCols.includes('role')) sqliteDb.exec("ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'registrar'");
    if (!adminCols.includes('department')) sqliteDb.exec('ALTER TABLE admins ADD COLUMN department TEXT');
  }
}

async function seed() {
  const adminCount = (await one('SELECT COUNT(*) as c FROM admins')).c;
  if (Number(adminCount) === 0) {
    const seedAdmins = [
      ['admin', 'admin123', 'Administrator', 'super_admin', null],
      ['registrar', 'registrar123', 'College Registrar', 'registrar', null],
      ['examcell', 'exam123', 'Exam Cell Officer', 'exam_cell', null],
    ];
    for (const [username, password, name, role, department] of seedAdmins) {
      await many(
        'INSERT INTO admins (username, password_hash, name, role, department) VALUES (?, ?, ?, ?, ?)',
        [username, bcrypt.hashSync(password, 10), name, role, department]
      );
    }
  } else {
    const superAdmin = await one("SELECT * FROM admins WHERE role = 'super_admin'");
    if (!superAdmin) {
      await many("UPDATE admins SET role = 'super_admin' WHERE username = 'admin'");
    }
  }

  const courseCount = (await one('SELECT COUNT(*) as c FROM courses')).c;
  if (Number(courseCount) === 0) {
    const courses = [
      ['B.Tech Computer Science & Engineering', 'Computer Science', '4 Years', 120, 'Covers programming, algorithms, AI/ML, systems and software engineering with strong industry exposure.'],
      ['B.Tech Electronics & Communication', 'Electronics', '4 Years', 90, 'Focuses on circuits, communication systems, embedded systems and VLSI design.'],
      ['B.Tech Mechanical Engineering', 'Mechanical', '4 Years', 90, 'Covers thermodynamics, manufacturing, robotics and design engineering.'],
      ['B.Tech Civil Engineering', 'Civil', '4 Years', 60, 'Covers structural design, construction management, surveying and environmental engineering.'],
      ['BBA - Business Administration', 'Management', '3 Years', 60, 'Builds foundation in management, finance, marketing and entrepreneurship.'],
      ['B.Sc Computer Science', 'Computer Science', '3 Years', 60, 'A science-focused program in computing, data structures and software fundamentals.'],
    ];
    for (const c of courses) {
      await many('INSERT INTO courses (title, department, duration, seats, description) VALUES (?, ?, ?, ?, ?)', c);
    }
  }

  const facultyCount = (await one('SELECT COUNT(*) as c FROM faculty')).c;
  if (Number(facultyCount) === 0) {
    const faculty = [
      ['Dr. Ramesh Iyer', 'Principal & Professor', 'Administration', 'Ph.D in Computer Science', 'principal@radiantcollege.edu'],
      ['Dr. Anjali Rao', 'Head of Department', 'Computer Science', 'Ph.D in AI & Machine Learning', 'anjali.rao@radiantcollege.edu'],
      ['Prof. Suresh Kumar', 'Associate Professor', 'Electronics', 'M.Tech, Ph.D (Pursuing)', 'suresh.kumar@radiantcollege.edu'],
      ['Dr. Priya Nair', 'Head of Department', 'Mechanical', 'Ph.D in Thermal Engineering', 'priya.nair@radiantcollege.edu'],
      ['Prof. Vikram Shah', 'Assistant Professor', 'Civil', 'M.E in Structural Engineering', 'vikram.shah@radiantcollege.edu'],
      ['Dr. Lakshmi Menon', 'Head of Department', 'Management', 'Ph.D in Finance', 'lakshmi.menon@radiantcollege.edu'],
    ];
    for (const f of faculty) {
      await many('INSERT INTO faculty (name, designation, department, qualification, email) VALUES (?, ?, ?, ?, ?)', f);
    }
  }

  const studentCount = (await one('SELECT COUNT(*) as c FROM students')).c;
  if (Number(studentCount) === 0) {
    const names = [
      ['CSE21001', 'Aarav Sharma', 'Computer Science', 3, 'aarav.sharma@student.radiant.edu', '9876500001', 92.5, 8.7],
      ['CSE21002', 'Diya Patel', 'Computer Science', 3, 'diya.patel@student.radiant.edu', '9876500002', 95.1, 9.1],
      ['CSE21003', 'Kabir Singh', 'Computer Science', 2, 'kabir.singh@student.radiant.edu', '9876500003', 88.3, 8.2],
      ['ECE21001', 'Isha Reddy', 'Electronics', 2, 'isha.reddy@student.radiant.edu', '9876500004', 90.0, 8.5],
      ['ECE21002', 'Arjun Verma', 'Electronics', 4, 'arjun.verma@student.radiant.edu', '9876500005', 85.4, 7.9],
      ['MECH21001', 'Sneha Gupta', 'Mechanical', 1, 'sneha.gupta@student.radiant.edu', '9876500006', 93.2, 8.9],
      ['CIVIL21001', 'Rohan Desai', 'Civil', 3, 'rohan.desai@student.radiant.edu', '9876500007', 81.7, 7.5],
      ['BBA21001', 'Meera Joshi', 'Management', 2, 'meera.joshi@student.radiant.edu', '9876500008', 96.0, 9.3],
      ['CSE22004', 'Yash Malhotra', 'Computer Science', 1, 'yash.malhotra@student.radiant.edu', '9876500009', 89.9, 8.0],
      ['BSC21001', 'Tanvi Kulkarni', 'Computer Science', 2, 'tanvi.kulkarni@student.radiant.edu', '9876500010', 91.1, 8.6],
    ];
    for (const s of names) {
      await many(
        'INSERT INTO students (roll_no, name, department, year, email, phone, attendance, cgpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        s
      );
    }
  }
}

async function init() {
  await execSchema();
  await seed();
}

module.exports = { many, one, init, USE_PG };
