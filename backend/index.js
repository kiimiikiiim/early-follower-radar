const fs = require('fs');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();
const { scrapeFollowing } = require('./scraper');
const { initializeScheduler, getStatus } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, '../database/radar.db');
let db;

try {
  db = new Database(dbPath);
  console.log('Connected to SQLite database at:', dbPath);
  initializeDatabase();
} catch (err) {
  console.error('Error opening database:', err.message);
  process.exit(1);
}

// Initialize database tables
function initializeDatabase() {
  try {
    // Big accounts table
    db.exec(`
      CREATE TABLE IF NOT EXISTS big_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        twitter_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tracked follows table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tracked_follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        big_account_id INTEGER NOT NULL,
        small_account_username TEXT NOT NULL,
        small_account_twitter_id TEXT,
        followed_at DATETIME NOT NULL,
        signal_score INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (big_account_id) REFERENCES big_accounts(id)
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
}

// Routes

// Health check
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Get all big accounts
app.get('/api/big-accounts', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM big_accounts ORDER BY created_at DESC');
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a big account
app.post('/api/big-accounts', (req, res) => {
  const { username, twitter_id } = req.body;
  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO big_accounts (username, twitter_id) VALUES (?, ?)'
    );
    const result = stmt.run(username, twitter_id || null);
    res.status(201).json({ id: result.lastInsertRowid, username, twitter_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tracked follows (high signal)
app.get('/api/tracked-follows', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT tf.*, ba.username as big_account_username 
      FROM tracked_follows tf 
      JOIN big_accounts ba ON tf.big_account_id = ba.id 
      ORDER BY tf.signal_score DESC, tf.followed_at DESC
    `);
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a tracked follow
app.post('/api/tracked-follows', (req, res) => {
  const { big_account_id, small_account_username, small_account_twitter_id, followed_at, signal_score } = req.body;

  if (!big_account_id || !small_account_username || !followed_at) {
    res.status(400).json({ error: 'big_account_id, small_account_username, and followed_at are required' });
    return;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tracked_follows (big_account_id, small_account_username, small_account_twitter_id, followed_at, signal_score) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      big_account_id,
      small_account_username,
      small_account_twitter_id || null,
      followed_at,
      signal_score || 0
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scrape following list endpoint
app.post('/api/scrape-following', async (req, res) => {
  const { username, limit } = req.body;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  try {
    console.log(`Starting scrape for @${username}...`);
    const following = await scrapeFollowing(username, limit || 100);
    
    res.json({
      success: true,
      username,
      count: following.length,
      accounts: following
    });
  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).json({ 
      error: 'Failed to scrape following list',
      details: err.message 
    });
  }
});

// Load signals from JSON file
function loadSignals() {
  try {
    const signalsPath = path.join(__dirname, 'data', 'signals.json');
    if (fs.existsSync(signalsPath)) {
      const data = fs.readFileSync(signalsPath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error loading signals:', err.message);
    return [];
  }
}

// Get all signals
app.get('/api/signals', (req, res) => {
  try {
    const signals = loadSignals();
    res.json({
      success: true,
      count: signals.length,
      signals: signals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get high-signal accounts (score >= 2)
app.get('/api/signals/high', (req, res) => {
  try {
    const signals = loadSignals();
    const highSignals = signals.filter(s => s.score >= 2);
    res.json({
      success: true,
      count: highSignals.length,
      signals: highSignals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent signals (latest 20)
app.get('/api/signals/recent', (req, res) => {
  try {
    const signals = loadSignals();
    const recentSignals = signals.slice(0, 20);
    res.json({
      success: true,
      count: recentSignals.length,
      signals: recentSignals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scrape and auto-save following list
app.post('/api/scrape-and-save', async (req, res) => {
  const { username, big_account_id, signal_score } = req.body;

  if (!username || !big_account_id) {
    res.status(400).json({ error: 'Username and big_account_id are required' });
    return;
  }

  try {
    console.log(`Scraping and saving follows for @${username}...`);
    const following = await scrapeFollowing(username, 200);
    
    // Get the big account to verify it exists
    const accountStmt = db.prepare('SELECT id FROM big_accounts WHERE id = ?');
    const account = accountStmt.get(big_account_id);
    
    if (!account) {
      return res.status(404).json({ error: 'Big account not found' });
    }
    
    // Insert all scraped accounts into database
    const insertStmt = db.prepare(`
      INSERT INTO tracked_follows (big_account_id, small_account_username, followed_at, signal_score) 
      VALUES (?, ?, ?, ?)
    `);
    
    let savedCount = 0;
    const now = new Date().toISOString();
    
    for (const account of following) {
      try {
        insertStmt.run(
          big_account_id,
          account.username,
          now,
          signal_score || 50
        );
        savedCount++;
      } catch (err) {
        // Skip duplicates or other errors
        console.error(`Failed to save ${account.username}:`, err.message);
      }
    }
    
    res.json({
      success: true,
      username,
      scrapedCount: following.length,
      savedCount,
      message: `Scraped ${following.length} accounts, saved ${savedCount} to database`
    });
  } catch (err) {
    console.error('Scraping and saving error:', err);
    res.status(500).json({ 
      error: 'Failed to scrape and save following list',
      details: err.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Scheduler endpoints
app.get('/api/scheduler/status', (req, res) => {
  try {
    const status = getStatus();
    res.json({
      success: true,
      status: status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Test the /ping endpoint: http://localhost:${PORT}/ping`);
  console.log(`🔄 Scraper endpoints available:`);
  console.log(`   - POST /api/scrape-following (returns scraped data)`);
  console.log(`   - POST /api/scrape-and-save (scrapes and saves to database)`);
  console.log(`📈 Signal endpoints available:`);
  console.log(`   - GET /api/signals (all signals)`);
  console.log(`   - GET /api/signals/high (score >= 2)`);
  console.log(`   - GET /api/signals/recent (latest 20)`);
  console.log(`⏰ Scheduler endpoint:`);
  console.log(`   - GET /api/scheduler/status (scheduler status)`);
  
  // Initialize scheduler
  initializeScheduler();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  try {
    db.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error(err.message);
  }
  process.exit(0);
});
