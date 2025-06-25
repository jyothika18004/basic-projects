// backend/database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path to your database file
const dbPath = path.resolve(__dirname, 'data', 'blog.db');

// Connect to the database
// If the file doesn't exist, it will be created.
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Run migrations/table creation after successful connection
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating Users table:', err.message);
            } else {
                console.log('Users table checked/created.');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS Posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('Error creating Posts table:', err.message);
            } else {
                console.log('Posts table checked/created.');
            }
        });
    }
});

// Export the database object so server.js can use it
module.exports = db;