import { useState, useEffect } from 'react';
import { getPhotos, addPhoto, updatePhoto, deletePhoto } from './api';
import PhotoList from './components/PhotoList';
import PhotoForm from './components/PhotoForm';
import './App.css';

function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const data = await getPhotos();
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleAdd = async (photoData) => {
    try {
      await addPhoto(photoData);
      await fetchPhotos(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, photoData) => {
    try {
      await updatePhoto(id, photoData);
      setEditingPhoto(null);
      await fetchPhotos(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(id);
        await fetchPhotos(); // Refresh list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>📸 Photo Manager</h1>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <main>
        <section className="form-section">
          <h2>{editingPhoto ? 'Edit Photo' : 'Add New Photo'}</h2>
          <PhotoForm 
            onSubmit={editingPhoto ? (data) => handleUpdate(editingPhoto.id, data) : handleAdd}
            initialData={editingPhoto}
            onCancel={() => setEditingPhoto(null)}
          />
        </section>

        <section className="list-section">
          <h2>Photo Gallery ({photos.length})</h2>
          {loading ? (
            <p className="loading-text">Loading photos...</p>
          ) : photos.length === 0 ? (
            <p className="empty-text">No photos found. Add one using the form!</p>
          ) : (
            <PhotoList 
              photos={photos} 
              onEdit={setEditingPhoto} 
              onDelete={handleDelete} 
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;