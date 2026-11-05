const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp'); // <-- Added

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

const dbPath = path.join(__dirname, 'database', 'database6.sqlite');
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
        image BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// ✅ POST - Add a photo (with image resizing)
app.post('/api/photos', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const filename = req.file.filename;
    const { title = '', description = '' } = req.body;

    // Read the original image
    const originalImagePath = path.join(uploadDir, filename);
    const originalImage = fs.readFileSync(originalImagePath);

    // Resize image to 800x600
    sharp(originalImage)
        .resize(800, 600)
        .jpeg({ quality: 80 })
        .toBuffer()
        .then(resizedBuffer => {
            // Insert resized image into DB
            db.run(
                `INSERT INTO photos (filename, title, description, image) VALUES (?, ?, ?, ?)`,
                [filename, title, description, resizedBuffer],
                function (err) {
                    if (err) return res.status(500).json({ error: 'Failed to add photo' });
                    res.status(201).json({ id: this.lastID, filename, title, description });
                }
            );
        })
        .catch(err => {
            return res.status(500).json({ error: 'Failed to resize image' });
        });
});

// ✅ PUT - Update photo (with optional resizing)
app.put('/api/photos/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { title, description } = req.body;
    const fields = [];
    const values = [];

    if (req.file) {
        const imageData = fs.readFileSync(path.join(uploadDir, req.file.filename));
        fields.push('image = ?');
        values.push(imageData);
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

// ✅ DELETE - Delete photo
app.delete('/api/photos/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT filename, image FROM photos WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Photo not found' });

        db.run('DELETE FROM photos WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: 'Failed to delete photo' });

            const filePath = path.join(uploadDir, row.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.json({ message: 'Photo deleted successfully' });
        });
    });
});

// ✅ Optional: Serve image directly from DB
app.get('/api/photos/:id/image', (req, res) => {
    const id = req.params.id;

    db.get('SELECT image FROM photos WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Photo not found' });

        res.setHeader('Content-Type', 'image/jpeg'); // or detect from buffer
        res.send(row.image);
    });
});

// ✅ Helper to detect MIME type (optional)
function getMimeType(buffer) {
    const bufferView = new Uint8Array(buffer);
    const firstBytes = bufferView.slice(0, 4);
    const magic = firstBytes[0] << 24 | firstBytes[1] << 16 | firstBytes[2] << 8 | firstBytes[3];

    if (magic === 0xFFD8FF) return 'image/jpeg';
    if (magic === 0x89504E47) return 'image/png';
    if (magic === 0x47494638) return 'image/gif';
    return 'application/octet-stream';
}

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
