console.log("POSTGRES START");

const { Pool } = require("pg");

// =====================================
// PostgreSQL Render
// =====================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// =====================================
// CREATE TABLES
// =====================================

async function initDatabase() {

    try {

        await pool.query(`
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    expire_date TIMESTAMP,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
`);

        await pool.query(`
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TIMESTAMP,
    home TEXT,
    away TEXT,
    pick TEXT,
    recommendation TEXT,
    mainBet TEXT,
    stars INTEGER,
    analysis TEXT,
    result TEXT,
    status TEXT DEFAULT 'pending'
);
`);

        console.log("POSTGRES READY");

    } catch (err) {

        console.log("POSTGRES ERROR");
        console.error(err);

        throw err;

    }

}

module.exports = {
    pool,
    initDatabase
};