const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Enable CORS for cross-origin requests (frontend)

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./database/database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

// Create the photos table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    title TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    position INTEGER DEFAULT 0
  )
`);

// API Endpoints
app.get('/api/photos', (req, res) => {
  db.all('SELECT * FROM photos ORDER BY position ASC', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve photos' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/photos/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(404).json({ error: 'Photo not found' });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Photo not found' });
    }
  });
});

// POST /api/photos - Add a photo
app.post('/api/photos', (req, res) => {
  const filename = req.body.filename;
  const title = req.body.title || '';
  const description = req.body.description || '';

  db.run(
    'INSERT INTO photos (filename, title, description) VALUES (?, ?, ?)',
    [filename, title, description],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add photo' });
      } else {
        // Reset position for the new photo
        db.run('UPDATE photos SET position = 0 WHERE id = ?', [req.body.id || null], (err) => {
          if(err){
            console.error(err);
            res.status(500).json({ error: 'Failed to reset position' });
          } else {
              res.status(201).json({ id: req.body.id || null, message: 'Photo added successfully' });
          }

        });
      }
    }
  );
});

// DELETE /api/photos/:id - Delete a photo
app.delete('/api/photos/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM photos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete photo' });
    } else {
      res.json({ message: 'Photo deleted successfully' });
    }
  });
});

// PUT /api/photos/:id - Update a photo (optional, but good practice)
app.put('/api/photos/:id', (req, res) => {
  const id = req.params.id;
  const filename = req.body.filename || null; // Allow setting to null for no change
  const title = req.body.title || null;
  const description = req.body.description || null;

  db.run(
    'UPDATE photos SET ' +
      (filename ? 'filename = ?, ' : '') +
      (title ? 'title = ?, ' : '') +
      (description ? 'description = ?, ' : '') +
      'WHERE id = ?',
    [filename, title, description, id],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update photo' });
      } else {
        res.json({ message: 'Photo updated successfully' });
      }
    }
  );
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
