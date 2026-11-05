
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const dbPath = path.join(dbDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// Create photos table
db.run(`
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        title TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        position INTEGER DEFAULT 0
    )
`, (err) => {
    if (err) {
        console.error('Table creation error:', err.message);
    }
});

// GET all photos
app.get('/api/photos', (req, res) => {
    db.all(
        'SELECT * FROM photos ORDER BY position ASC, id DESC',
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Failed to retrieve photos'
                });
            }

            res.json(rows);
        }
    );
});

// GET photo by ID
app.get('/api/photos/:id', (req, res) => {
    const id = req.params.id;

    db.get(
        'SELECT * FROM photos WHERE id = ?',
        [id],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Database error'
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: 'Photo not found'
                });
            }

            res.json(row);
        }
    );
});

// POST - Add a photo
app.post('/api/photos', (req, res) => {
    const { filename, title = '', description = '' } = req.body;

    if (!filename || typeof filename !== 'string') {
        return res.status(400).json({
            error: 'Filename is required'
        });
    }

    db.run(
        `INSERT INTO photos (filename, title, description)
         VALUES (?, ?, ?)`,
        [filename, title, description],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Failed to add photo'
                });
            }

            res.status(201).json({
                id: this.lastID,
                filename,
                title,
                description,
                message: 'Photo added successfully'
            });
        }
    );
});

// DELETE - Delete a photo
app.delete('/api/photos/:id', (req, res) => {
    const id = req.params.id;

    db.run(
        'DELETE FROM photos WHERE id = ?',
        [id],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: 'Failed to delete photo'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: 'Photo not found'
                });
            }

            res.json({
                message: 'Photo deleted successfully'
            });
        }
    );
});

// PUT - Update a photo
app.put('/api/photos/:id', (req, res) => {
    const id = req.params.id;
    const { filename, title, description, position } = req.body;

    const fields = [];
    const values = [];

    if (filename !== undefined) {
        fields.push('filename = ?');
        values.push(filename);
    }

    if (title !== undefined) {
        fields.push('title = ?');
        values.push(title);
    }

    if (description !== undefined) {
        fields.push('description = ?');
        values.push(description);
    }

    if (position !== undefined) {
        fields.push('position = ?');
        values.push(position);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            error: 'No fields provided for update'
        });
    }

    values.push(id);

    const sql = `
        UPDATE photos
        SET ${fields.join(', ')}
        WHERE id = ?
    `;

    db.run(sql, values, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: 'Failed to update photo'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: 'Photo not found'
            });
        }

        res.json({
            message: 'Photo updated successfully'
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Handle database shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }

        console.log('Database connection closed.');
        process.exit(0);
    });
});
