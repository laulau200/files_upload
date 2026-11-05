function PhotoList({ photos, onEdit, onDelete }) {
  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <div key={photo.id} className="photo-card">
          <div className="photo-image-placeholder">
            {/* Note: Replace with <img src={`/uploads/${photo.filename}`} /> if you serve static files */}
            <span>📷 {photo.filename}</span>
          </div>
          <div className="photo-details">
            <h3>{photo.title || 'Untitled'}</h3>
            <p>{photo.description || 'No description provided.'}</p>
            <small>Added: {new Date(photo.created_at).toLocaleDateString()}</small>
          </div>
          <div className="photo-actions">
            <button className="btn-edit" onClick={() => onEdit(photo)}>
              Edit
            </button>
            <button className="btn-delete" onClick={() => onDelete(photo.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PhotoList;