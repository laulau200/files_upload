const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // <-- Required for file uploads

const app = express();
const PORT = 3001; // Keep different from React's default port 3000

app.use(express.json());
app.use(cors());

// ==========================================
// 1. CREATE & CONFIGURE THE UPLOADS FOLDER
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');

// Create the folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve the 'uploads' folder statically so the frontend can display the images
// Example: http://localhost:3001/uploads/image-123.jpg
app.use('/uploads', express.static(uploadDir));

// ==========================================
// 2. DATABASE SETUP
// ==========================================
const dbPath = path.join(__dirname, 'database', 'database6.sqlite');
// Ensure database folder exists too
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to the database.');
});

db.run(`
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        title TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// ==========================================
// 3. CONFIGURE MULTER STORAGE
// ==========================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // <-- Saves the file to the 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Creates a unique filename to prevent overwrites (e.g., 1690000000000-123456.jpg)
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 4. ROUTES
// ==========================================

// GET all photos
app.get('/api/photos', (req, res) => {
    db.all('SELECT * FROM photos ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve photos' });
        res.json(rows);
    });
});

// POST - Add a photo (Saves file to 'uploads' folder)
app.post('/api/photos', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    const filename = req.file.filename; // The unique name saved in the uploads folder
    const { title = '', description = '' } = req.body;

    db.run(
        `INSERT INTO photos (filename, title, description) VALUES (?, ?, ?)`,
        [filename, title, description],
        function (err) {
            if (err) return res.status(500).json({ error: 'Failed to add photo' });
            res.status(201).json({ id: this.lastID, filename, title, description });
        }
    );
});

// PUT - Update a photo
app.put('/api/photos/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { title, description } = req.body;
    const fields = [];
    const values = [];

    // If a new file is uploaded, update the filename
    if (req.file) {
        fields.push('filename = ?');
        values.push(req.file.filename);
    }
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields provided' });

    values.push(id);
    const sql = `UPDATE photos SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update photo' });
        if (this.changes === 0) return res.status(404).json({ error: 'Photo not found' });
        res.json({ message: 'Photo updated successfully' });
    });
});

// DELETE - Delete photo AND remove file from 'uploads' folder
app.delete('/api/photos/:id', (req, res) => {
    const id = req.params.id;

    // First, get the filename to delete it from the folder
    db.get('SELECT filename FROM photos WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Photo not found' });

        // Delete from database
        db.run('DELETE FROM photos WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: 'Failed to delete photo' });

            // Delete the actual file from the 'uploads' folder
            const filePath = path.join(uploadDir, row.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Removes the file from disk
            }

            res.json({ message: 'Photo deleted successfully' });
        });
    });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));