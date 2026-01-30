const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'data', 'forms.db')

// Ensure data directory exists
const fs = require('fs')
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL')

// Create main submissions table
db.exec(`
  CREATE TABLE IF NOT EXISTS form_submissions (
    id TEXT PRIMARY KEY,
    form_type TEXT NOT NULL,
    terminal TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    data TEXT NOT NULL,
    email_sent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

// Create indexes for common queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_form_type ON form_submissions(form_type);
  CREATE INDEX IF NOT EXISTS idx_terminal ON form_submissions(terminal);
  CREATE INDEX IF NOT EXISTS idx_submitted_at ON form_submissions(submitted_at);
`)

// Create report schedules table
db.exec(`
  CREATE TABLE IF NOT EXISTS report_schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    time TEXT NOT NULL,
    terminal TEXT,
    recipients TEXT NOT NULL,
    format TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_run_at TEXT,
    last_run_status TEXT
  )
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_schedules_active ON report_schedules(is_active);
`)

console.log('Database initialized successfully')

module.exports = db
