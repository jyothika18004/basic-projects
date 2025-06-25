// backend/server.js

const express = require('express');
const cors = require('cors');
const db = require('./database'); // Import the database connection

const app = express();
const port = 5000; // You can choose any available port

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// --- API Endpoints ---

// Endpoint 1: Add a new user (blogger)
app.post('/api/users', (req, res) => {
    const { username, email } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const sql = `INSERT INTO Users (username, email) VALUES (?, ?)`;
    db.run(sql, [username, email], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Username or email already exists.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'User created successfully',
            user_id: this.lastID,
            username,
            email
        });
    });
});

// Endpoint 2: Add a new blog post
app.post('/api/posts', (req, res) => {
    const { user_id, title, content } = req.body;

    if (!user_id || !title || !content) {
        return res.status(400).json({ error: 'User ID, title, and content are required.' });
    }

    // First, check if the user_id exists
    db.get(`SELECT user_id FROM Users WHERE user_id = ?`, [user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: `User with ID ${user_id} not found.` });
        }

        // If user exists, insert the post
        const sql = `INSERT INTO Posts (user_id, title, content) VALUES (?, ?, ?)`;
        db.run(sql, [user_id, title, content], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                message: 'Post created successfully',
                post_id: this.lastID,
                user_id,
                title,
                content
            });
        });
    });
});

// Endpoint 3: Get all blog posts (with author details)
app.get('/api/posts', (req, res) => {
    const sql = `
        SELECT
            p.post_id,
            p.title,
            p.content,
            p.created_at,
            p.updated_at,
            u.user_id,
            u.username,
            u.email
        FROM Posts p
        JOIN Users u ON p.user_id = u.user_id
        ORDER BY p.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Endpoint 4: Get posts by a specific user
app.get('/api/users/:user_id/posts', (req, res) => {
    const user_id = req.params.user_id;
    const sql = `
        SELECT
            p.post_id,
            p.title,
            p.content,
            p.created_at,
            p.updated_at,
            u.username
        FROM Posts p
        JOIN Users u ON p.user_id = u.user_id
        WHERE u.user_id = ?
        ORDER BY p.created_at DESC
    `;
    db.all(sql, [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: `No posts found for user ID ${user_id}, or user does not exist.` });
        }
        res.json(rows);
    });
});

// Endpoint 5: Get the total number of unique bloggers (users)
app.get('/api/stats/bloggers', (req, res) => {
    const sql = `SELECT COUNT(DISTINCT user_id) AS total_bloggers FROM Users`;
    db.get(sql, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ total_bloggers: row.total_bloggers });
    });
});

// Endpoint 6: Get the total number of blog posts
app.get('/api/stats/posts', (req, res) => {
    const sql = `SELECT COUNT(*) AS total_posts FROM Posts`;
    db.get(sql, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ total_posts: row.total_posts });
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});